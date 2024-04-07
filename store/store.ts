import dayjs from 'dayjs';
import { randomUUID } from 'expo-crypto';
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite/next';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';

import { sortedArrayString } from '../utilities';
import { db_name } from '../utilities/constants';

type BaseUser = {
  address: string;
  publicKey: string;
};

type User = BaseUser;
type Admin = BaseUser & {
  privateKey: string;
};

type Message = {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  receiver: string;
  timestamp: string;
};

class Store {
  async deleteUser(db: SQLiteDatabase, address: string) {
    try {
      await db.runAsync('DELETE FROM users WHERE address = ?', [address]);
      this.proxy(() => {
        this.messages = _.filter(this.messages, (message) => {
          return message.sender !== address && message.receiver !== address;
        });
        this.users = _.filter(this.users, (user) => user.address !== address);
      });
    } catch (error) {
      console.error(error);
    }
  }

  async addMessage(db: SQLiteDatabase, sender: string, receiver: string, content: string) {
    const message = {
      id: randomUUID(),
      chatId: sortedArrayString([sender, receiver]),
      sender,
      content,
      receiver,
      timestamp: dayjs().toISOString(),
    };

    try {
      await db.runAsync(
        'INSERT INTO messages (id, chatId, sender, content, receiver, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [
          message.id,
          message.chatId,
          message.sender,
          message.content,
          message.receiver,
          message.timestamp,
        ],
      );
      this.proxy(() => {
        this.messages = _.unionBy(this.messages, [message], 'id');
      });
    } catch (error) {
      console.error(error);
    }
  }

  async loadRecents(db: SQLiteDatabase) {
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

  async loadChat(db: SQLiteDatabase, chatId: string) {
    const messages = await db.getAllAsync<Message>('SELECT * FROM messages WHERE chatId = ?', [
      chatId,
    ]);
    this.proxy(() => {
      this.messages = _.unionBy(this.messages, messages, 'id');
    });
  }
  proxy(arg0: () => void) {
    arg0();
  }

  async addUser(db: SQLiteDatabase, user: User) {
    this.users = _.unionBy(this.users, [user], 'address');
    await db.runAsync('INSERT INTO users (address, publicKey) VALUES (?, ?)', [
      user.address,
      user.publicKey,
    ]);
  }

  db: SQLiteDatabase | null = null;
  loading: boolean = false;
  users: BaseUser[] = [];
  messages: Message[] = [];

  constructor() {
    makeObservable(this, {
      users: observable,
      messages: observable,
      loading: observable,
      init: action,
      initializeUsers: action,
      addUser: action,
      deleteUser: action,
      addMessage: action,
      loadRecents: action,
      loadChat: action,
      proxy: action,
    });
    this.init();
  }

  init() {
    this.loading = true;
    openDatabaseAsync(db_name)
      .then((db) => {
        this.db = db;
        this.initializeUsers(db);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  async initializeUsers(db: SQLiteDatabase) {
    this.users = _.unionBy(
      this.users,
      await db.getAllAsync<User>('SELECT * FROM users'),
      'address',
    );
  }
}

export { User, Message, Admin };
export default new Store();
