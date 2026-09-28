// common_components/ErrorScreen.tsx
import { Html, Text } from '@react-three/drei';
import { COLORS } from '../colors';

interface ErrorScreenProps {
  error: string;
  onRetry: () => void;
}

export default function ErrorScreen({ error, onRetry }: ErrorScreenProps) {
  return (
    <Html center>
      <div style={{ 
        color: COLORS.EXPENSE, 
        textAlign: 'center',
        padding: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px'
      }}>
        <div style={{ marginBottom: '10px', fontSize: '2rem' }}>❌</div>
        <Text fontSize={0.3} color={COLORS.EXPENSE}>
          Error loading data
        </Text>
        <Text fontSize={0.2} color={COLORS.PRIMARY}>
          {error}
        </Text>
        <button
          onClick={onRetry}
          style={{
            background: COLORS.PRIMARY,
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    </Html>
  );
}
