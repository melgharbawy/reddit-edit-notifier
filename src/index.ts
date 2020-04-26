import twilio from "twilio";
import snoowrap from 'snoowrap';
import fs from "fs";

const threadId = 'TODO';
const twilioNumber = 'TODO';
const myNumber = 'TODO';
const accountSid = 'TODO';
const authToken = 'TODO';
const twilioClient = twilio(accountSid, authToken);

const r = new snoowrap({
  userAgent: 'TODO',
  clientId: 'TODO',
  clientSecret: 'TODO',
  username: 'TODO',
  password: 'TODO'
});

const dir = './thread';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

interface ThreadFile {
  title: string;
  body: string;
  url: string;
}

function readThreadFile(path: string): ThreadFile {
  if (fs.existsSync(path)) {
    const file = fs.readFileSync(path);
    return JSON.parse(file.toString());
  } else {
    console.log(`thread doesn't exist`);
  }
}

function updateThreadFile(path: string, content: string): void {
  fs.writeFileSync(path, content, { flag: 'w+' });
}

function notifyMe(message: string): void {
  twilioClient.messages
    .create({
      body: message,
      from: twilioNumber,
      to: myNumber
    })
    .then(message => console.log(`message sent! (id: ${message.sid})`));
}

async function checkReddit() {
  return new Promise<Omit<snoowrap.Submission, 'then'>>((resolve, reject) => {
    r.getSubmission(threadId).fetch().then((response: snoowrap.Submission) => resolve(response)).catch(err => reject(err));
  })
}

async function main() {
    const submission = await checkReddit();
    const newThread: ThreadFile = {
      title: submission.title,
      body: submission.selftext,
      url: submission.url
    };
    const existingThread = readThreadFile(`${dir}/${threadId}`);
    if (
      !!existingThread
      && existingThread.title === newThread.title
      && existingThread.body === newThread.body) {
      console.log(`[${new Date().toString()}] no updates available`);
    } else {
      updateThreadFile(`${dir}/${threadId}`, JSON.stringify(newThread));
      const message = `[r/wallstreetbets] ${newThread.title} has been updated. ${newThread.url}`;
      console.log(`[${new Date().toString()}] ${message}`);
      notifyMe(message);
    }
    // r.getSubmission(threadId).fetch().then((response: snoowrap.Submission) => {
    //   // console.log(response.title);
    //   // console.log(response.selftext_html);
    //   // console.log(response.url);

    // })
}

setInterval(async () => await main(), 10000);
