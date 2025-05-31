import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/features/ChatInterface'; // Renamed CodeGenerator to ChatInterface for clarity

export default function HomePage() {
  return (
    <AppLayout>
      <ChatInterface />
    </AppLayout>
  );
}
