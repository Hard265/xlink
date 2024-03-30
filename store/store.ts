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
  async initializeUser(db: SQLiteDatabase, address: string) {
    return await db.getFirstAsync<User>('SELECT * FROM users WHERE address = ?', address);
  }

  users: User[] = [];
  messages: Message[] = [];
  constructor() {
    makeObservable(this, {
      users: observable,
      messages: observable,
      addUser: action,
      addMessage: action,
      proxy: action,
    });
  }

  async addUser(db: SQLiteDatabase, user: User) {
    try {
      db.runAsync(
        'INSERT INTO users(address, displayName, publicKey) VALUES (?, ?, ?)',
        user.address,
        user.displayName,
        user.publicKey,
      );
      this.proxy(() => (this.users = _.union(this.users, [user])));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
    return true;
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
