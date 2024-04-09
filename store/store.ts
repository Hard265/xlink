import '../polyfills/text-encoding';
import 'fast-text-encoding';
import { SQLiteDatabase, openDatabaseAsync } from 'expo-sqlite/next';
import _ from 'lodash';
import { action, makeObservable, observable } from 'mobx';
import { Socket } from 'socket.io-client';

import { db_name } from '../utilities/constants';

type BaseUser = {
  address: string;
  publicKey: string;
};

type User = BaseUser;
type Admin = BaseUser & {
  privateKey: string;
};

enum messageState {
  SENT = 'SENT',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
}

type Message = {
  id: string;
  chatId: string;
  sender: string;
  content: string;
  receiver: string;
  timestamp: string;
  state: keyof typeof messageState;
};

class Store {
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
      send: action,
      loadRecents: action,
      loadChat: action,
      proxy: action,
      reset: action,
    });
    this.init();
  }

  async send(db: SQLiteDatabase, socket: Socket, message: Message) {
    try {
      //1st persist the message
      await insert_message(db, message);
      //2nd store it in the store
      this.proxy(() => {
        this.messages = _.unionBy(this.messages, [message], 'id');
      });
      //3rd send it to the server
      socket
        .emitWithAck('message', JSON.stringify(message))
        .then(() => {
          //4th update the message state to sent
          this.proxy(() => {
            const messageIndex = _.findIndex(this.messages, (m) => m.id === message.id);
            db.runSync("UPDATE messages SET state = 'SENT' WHERE id = ?", [message.id]);
            if (messageIndex !== -1) {
              this.messages[messageIndex].state = messageState.SENT;
            }
          });
        })
        .catch(() => {
          //5th update the message state to failed
          this.proxy(() => {
            const messageIndex = _.findIndex(this.messages, (m) => m.id === message.id);
            db.runSync("UPDATE messages SET state = 'FAILED' WHERE id = ?", [message.id]);
            if (messageIndex !== -1) {
              this.messages[messageIndex].state = messageState.FAILED;
            }
          });
        });
    } catch (error) {
      console.error(error);
    }
  }

  async receive(db: SQLiteDatabase, message: Message) {
    try {
      await insert_message(db, message);
      this.proxy(() => {
        this.messages = _.unionBy(this.messages, [message], 'id');
      });
    } catch (error) {
      console.error(error);
    }
  }

  reset() {
    this.users = [];
    this.messages = [];
  }
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

async function insert_message(db: SQLiteDatabase, message: Message) {
  await db.runAsync(
    'INSERT OR IGNORE INTO messages (id, chatId, sender, content, receiver, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
    [
      message.id,
      message.chatId,
      message.sender,
      message.content,
      message.receiver,
      message.timestamp,
    ],
  );
}
