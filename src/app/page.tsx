import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeGenerator } from '@/components/features/CodeGenerator'; // This now renders the ChatBot
import { DocumentationSearch } from '@/components/features/DocumentationSearch';
import { VersionHistory } from '@/components/features/VersionHistory';
import { ExamplesDisplay } from '@/components/features/ExamplesDisplay';
import { Bot, BookOpen, History, Lightbulb } from 'lucide-react'; // Changed Wand2 to Bot

export default function HomePage() {
  return (
    <AppLayout>
      <Tabs defaultValue="chat" className="w-full"> {/* Changed default value to 'chat' */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 shadow-sm">
          <TabsTrigger value="chat" className="py-3 text-sm md:text-base"> {/* Changed value and text */}
            <Bot className="mr-2 h-5 w-5" /> AI Chat {/* Changed icon and text */}
          </TabsTrigger>
          <TabsTrigger value="documentation" className="py-3 text-sm md:text-base">
            <BookOpen className="mr-2 h-5 w-5" /> Docs
          </TabsTrigger>
          <TabsTrigger value="versions" className="py-3 text-sm md:text-base">
            <History className="mr-2 h-5 w-5" /> Versions
          </TabsTrigger>
          <TabsTrigger value="examples" className="py-3 text-sm md:text-base">
            <Lightbulb className="mr-2 h-5 w-5" /> Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat"> {/* Changed value */}
          <CodeGenerator /> {/* This component is now the ChatBot */}
        </TabsContent>
        <TabsContent value="documentation">
          <DocumentationSearch />
        </TabsContent>
        <TabsContent value="versions">
          <VersionHistory />
        </TabsContent>
        <TabsContent value="examples">
          <ExamplesDisplay />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
