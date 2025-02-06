import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface Message {
    content: any;
    timestamp: number;
}

type ResolveCallback = (message: Message) => void;

interface Queue {
    messages: Message[];
    waitingConsumers: ResolveCallback[];
}

const queues: Record<string, Queue> = {};

function getOrCreateQueue(queueName: string): Queue {
    if (!queues[queueName]) {
        queues[queueName] = {
            messages: [],
            waitingConsumers: []
        };
    }
    return queues[queueName];
}

app.get('/api/queues', (req: Request, res: Response) => {
    const queueList = Object.entries(queues).map(([name, queue]) => ({
        name,
        messageCount: queue.messages.length
    }));
    res.send(queueList);
});

app.post('/api/:queueName', (req: Request, res: Response) => {
    const { queueName } = req.params;
    const queue = getOrCreateQueue(queueName);
    
    const message: Message = {
        content: req.body,
        timestamp: Date.now()
    };

    const waitingConsumer = queue.waitingConsumers.shift();
    if (waitingConsumer) {
        waitingConsumer(message);
    } else {
        queue.messages.push(message);
    }

    res.sendStatus(204);
});


app.get('/api/:queueName', (req: Request, res: Response) => { 
    const { queueName } = req.params;
    const timeout = parseInt(req.query.timeout as string) || 10000;
    const queue = getOrCreateQueue(queueName);

    if (queue.messages.length > 0) {
        const message = queue.messages.shift()!; // it should have at lease one message
        res.send(message.content);
        return;
    }

    const resolve = (message: Message) => {
        clearTimeout(timeoutId);
        res.send(message.content);
    };

    const timeoutId = setTimeout(() => {
        queue.waitingConsumers = queue.waitingConsumers.filter(
            consumer => consumer !== resolve
        );
        res.status(204).end();
    }, timeout);

    queue.waitingConsumers.push(resolve);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
