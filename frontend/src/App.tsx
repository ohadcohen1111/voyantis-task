import { useState, useEffect } from 'react'
import styled from 'styled-components'

interface Queue {
  name: string;
  messageCount: number;
}

const Container = styled.div`
  padding: 40px 20px;
  margin: 0 auto;
  background-color: #f8f9fa;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`

const Title = styled.h1`
  font-size: 48px;
  color: #0c2340;
  font-weight: 700;
  margin-bottom: 16px;
`

const SubTitle = styled.p`
  font-size: 18px;
  color: #4a5568;
  max-width: 700px;
  margin: 0 auto 30px;
  line-height: 1.6;
`

const QueueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`

const QueueCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`

const QueueIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: #e5edff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 24px;
`

const QueueName = styled.h3`
  font-size: 18px;
  color: #0c2340;
  margin-bottom: 8px;
  font-weight: 600;
`

const MessageCount = styled.div`
  color: #4a5568;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Badge = styled.span`
  background-color: #e5edff;
  color: #0c2340;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
`

const Controls = styled.div`
  display: flex;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto 40px;
`

const Select = styled.select`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #0c2340;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #0c2340;
  }
`

const Button = styled.button<{ disabled?: boolean }>`
  background-color: ${props => props.disabled ? '#94a3b8' : '#0c2340'};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.disabled ? '#94a3b8' : '#1a365d'};
  }
`

const ResponseContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`

const ResponseHeader = styled.h3`
  color: #0c2340;
  margin-bottom: 16px;
  font-size: 20px;
  font-weight: 600;
`

const ResponseContent = styled.pre`
  background-color: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
`

function App() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQueues = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/queues');
      const data = await response.json();
      setQueues(data);
    } catch (error) {
      console.error('Error fetching queues:', error);
    }
  };

  useEffect(() => {
    fetchQueues();
    const interval = setInterval(fetchQueues, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFetchQueue = async () => {
    if (!selectedQueue) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/${selectedQueue}`);
      if (response.status === 204) {
        setResponse('No messages available');
      } else {
        const data = await response.json();
        setResponse(data);
      }
    } catch (error) {
      console.error('Error fetching queue content:', error);
      setResponse('Error fetching queue content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Value Based</Title>
        <SubTitle>
          Monitor and manage your message queues with real-time updates and instant access to queue contents.
        </SubTitle>
      </Header>

      <QueueGrid>
        {queues.map((queue) => (
          <QueueCard key={queue.name}>
            <QueueIcon>📨</QueueIcon>
            <QueueName>{queue.name}</QueueName>
            <MessageCount>
              Messages: <Badge>{queue.messageCount}</Badge>
            </MessageCount>
          </QueueCard>
        ))}
      </QueueGrid>

      <Controls>
        <Select
          value={selectedQueue}
          onChange={(e) => setSelectedQueue(e.target.value)}
        >
          <option value="">Select a queue</option>
          {queues.map((queue) => (
            <option key={queue.name} value={queue.name}>
              {queue.name}
            </option>
          ))}
        </Select>
        <Button
          onClick={handleFetchQueue}
          disabled={!selectedQueue || isLoading}
        >
          {isLoading ? 'Loading...' : 'Go'}
        </Button>
      </Controls>

      {response && (
        <ResponseContainer>
          <ResponseHeader>Queue Content</ResponseHeader>
          <ResponseContent>
            {typeof response === 'object' 
              ? JSON.stringify(response, null, 2)
              : response}
          </ResponseContent>
        </ResponseContainer>
      )}
    </Container>
  )
}

export default App