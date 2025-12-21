import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Quote {
  text: string;
  author: string;
}

interface QuoteDisplayProps {
  quote: Quote;
}

export const QuoteDisplay: FC<QuoteDisplayProps> = ({ quote }) => {
  return (
    <Card className="mt-12 border-l-4 border-cyan-300 bg-white/50 shadow-sm backdrop-blur-sm">
      <CardContent className="p-6">
        <blockquote>
          <p className="text-lg italic text-gray-700">{quote.text}</p>
          <footer className="mt-4 text-sm font-medium text-gray-500">
            — {quote.author}
          </footer>
        </blockquote>
      </CardContent>
    </Card>
  );
};
