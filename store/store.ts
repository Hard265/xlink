import { SQLiteDatabase } from 'expo-sqlite/next';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

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
    const messages = await db.getAllAsync<Message>(`SELECT m.*
    FROM messages m
    INNER JOIN (
      SELECT sender, receiver, MAX(timestamp) AS latest_timestamp
      FROM messages
      GROUP BY sender, receiver
    ) latest ON m.sender = latest.sender 
        AND m.receiver = latest.receiver 
        AND m.timestamp = latest.latest_timestamp;`);
    this.proxy(() => {
      this.messages = _.unionBy(this.messages, messages, 'id');
    });
  }

  async initializeUsers(db: SQLiteDatabase) {
    const users = await db.getAllAsync<User>('SELECT * FROM users');
    this.proxy(() => {
      this.users = _.unionBy(this.users, users, 'address');
    });
  }

  initializeUser(db: SQLiteDatabase, address: string) {
    this.proxy(async () => {
      this.users = _.unionBy(
        this.users,
        _.compact([await db.getFirstAsync<User>('SELECT * FROM users WHERE address = ?', address)]),
        'address',
      );
    });
  }

  async initializeChat(db: SQLiteDatabase, chatId: string) {
    const chat = await db.getAllAsync<Message>('SELECT * FROM messages WHERE chatId = ?', chatId);

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
      initializeUsers: action,
      initializeUser: action,
      initializeChat: action,
      proxy: action,
    });
  }

  async addUser(db: SQLiteDatabase, u: User) {
    try {
      await db.runAsync(
        'INSERT INTO users(address, displayName, publicKey) VALUES (?, ?, ?)',
        u.address,
        u.displayName,
        u.publicKey,
      );
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

  async addMessage(db: SQLiteDatabase, message: Message) {
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

  proxy(cb: () => void) {
    cb();
  }
}

export { User, BaseUser, Message };
export default new Store();
