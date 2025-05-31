import { AppLayout } from '@/components/layout/AppLayout';
import { ChatInterface } from '@/components/features/CodeGenerator'; // Corrected import path

export default function HomePage() {
  return (
    <AppLayout>
      <ChatInterface />
    </AppLayout>
  );
}
