import dayjs from 'dayjs';
import { randomUUID } from 'expo-crypto';
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite/next';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

import { sortedArrayString } from '../utilities';

interface User {
  readonly address: string;
  readonly publicKey: string;
  readonly displayName: string;
}

class User {
  static fromJson(json: { address: string; publicKey: string; displayName: string }) {
    return new User(json.address, json.publicKey, json.displayName);
  }
  constructor(
    readonly address: string,
    readonly publicKey: string,
    readonly displayName: string,
  ) {}

  public toJson(): string {
    return JSON.stringify(this);
  }
}

class BaseUser extends User {
  static fromJson(json: {
    address: string;
    publicKey: string;
    displayName: string;
    privateKey: string;
  }): BaseUser {
    return new BaseUser(json.address, json.publicKey, json.displayName, json.privateKey);
  }
  constructor(
    readonly address: string,
    readonly publicKey: string,
    readonly displayName: string,
    readonly privateKey: string,
  ) {
    super(address, publicKey, displayName);
  }

  public toJson(): string {
    return JSON.stringify(this);
  }
}

class Message {
  static fromJson(json: Message) {
    return new Message(
      json.id,
      json.chatId,
      json.sender,
      json.receiver,
      json.content,
      json.timestamp,
    );
  }
  constructor(
    readonly id: string,
    readonly chatId: string,
    readonly sender: User['address'],
    readonly receiver: User['address'],
    readonly content: string,
    readonly timestamp: string,
  ) {}
}

class Store {
  async initializeRecents(db: SQLiteDatabase) {
    // Get all messages from the database
    const messages = await db.getAllAsync<Message>(`SELECT m.*
    FROM messages m
    INNER JOIN (
      SELECT sender, receiver, MAX(timestamp) AS latest_timestamp
      FROM messages
      GROUP BY sender, receiver
    ) latest ON m.sender = latest.sender 
        AND m.receiver = latest.receiver 
        AND m.timestamp = latest.latest_timestamp;`);
    // Union the messages with the current message array
    this.proxy(() => {
      this.messages = _.unionBy(this.messages, messages, 'id');
    });
  }

  // Asynchronously initialize the users table
  async initializeUsers(db: SQLiteDatabase) {
    // Get all users from the database
    const users = await db.getAllAsync<User>('SELECT * FROM users');
    // Union the users from the database with the current users
    this.proxy(() => {
      this.users = _.unionBy(this.users, users, 'address');
    });
  }

  // Initializes the user with the given address.
  initializeUser(db: SQLiteDatabase, address: string) {
    this.proxy(async () => {
      // Union the given address with the existing users in the proxy.
      this.users = _.unionBy(
        this.users,
        _.compact([await db.getFirstAsync<User>('SELECT * FROM users WHERE address = ?', address)]),
        'address',
      );
    });
  }

  // Initializes the chat with the given chatId.
  async initializeChat(db: SQLiteDatabase, chatId: string) {
    // Get all messages in the chat.
    const chat = await db.getAllAsync<Message>('SELECT * FROM messages WHERE chatId = ?', chatId);

    // Union the messages with the existing messages in the proxy.
    this.proxy(() => {
      this.messages = _.unionBy(this.messages, chat, 'id');
    });
  }

  users: User[] = [];
  messages: Message[] = [];
  constructor() {
    makeObservable(this, {
      users: observable,
      messages: observable,
      addUser: action,
      addMessage: action,
      initializeRecents: action,
      initializeUser: action,
      initializeUsers:action,
      initializeChat: action,
      proxy: action,
    });
  }

  /**
   * Adds a new user to the database and the store
   * @param db database instance
   * @param u the user object to add
   * @returns a boolean indicating if the operation was successful
   */
  async addUser(db: SQLiteDatabase, u: User) {
    try {
      // Insert the user into the users table of the database
      await db.runAsync(
        'INSERT INTO users(address, displayName, publicKey) VALUES (?, ?, ?)',
        u.address,
        u.displayName,
        u.publicKey,
      );
      // Union the current list of users with the new user
      this.proxy(() => (this.users = _.union(this.users, [u])));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * delete a given user from the database and the store
   * @param db database instance
   * @param a target user address
   */
  async deleteUser(db: SQLiteDatabase, a: string) {
    await db.runAsync('DELETE FROM users WHERE address = ?', a);
    this.proxy(() => (this.users = _.reject(this.users, (u) => u.address === a)));
  }

  /**
   * Adds a new message to the database and the store
   * @param db database instance
   * @param sender the sender's address
   * @param receiver the receiver's address
   * @param content the message content
   * @returns a boolean indicating if the operation was successful
   */
  async addMessage(db: SQLiteDatabase, sender: string, receiver: string, content: string) {
    const message = Message.fromJson({
      id: randomUUID(),
      chatId: sortedArrayString([sender, receiver]),
      sender,
      receiver,
      content,
      timestamp: dayjs().toISOString(),
    });
    try {
      await db.runAsync(
        'INSERT INTO messages (id, chatId, sender, receiver, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        message.id,
        message.chatId,
        message.sender,
        message.receiver,
        message.content,
        message.timestamp,
      );
      this.proxy(() => (this.messages = _.unionBy(this.messages, [message])));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
    return true;
  }

  /**
   * Proxy function to update the store state
   * @param cb - callback function to execute when the state is updated
   */
  proxy(cb: () => void) {
    cb();
  }
}

export { User, BaseUser, Message };
export default new Store();
