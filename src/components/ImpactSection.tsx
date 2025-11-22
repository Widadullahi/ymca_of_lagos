import React from 'react';

interface ImpactSectionProps {
  title?: string;
  paragraphs: {
    content: string;
    highlightedText?: {
      text: string;
      className?: string;
    }[];
  }[];
  className?: string;
}

const ImpactSection: React.FC<ImpactSectionProps> = ({ 
  title = "Our Impact", 
  paragraphs,
  className = "mb-16"
}) => {
  // Function to process paragraph content with highlighted text
  const renderParagraphWithHighlights = (paragraph: ImpactSectionProps['paragraphs'][0]) => {
    if (!paragraph.highlightedText || paragraph.highlightedText.length === 0) {
      return paragraph.content;
    }

    let result = [];
    let lastIndex = 0;
    
    // Sort highlighted text by their position in the content
    const sortedHighlights = [...paragraph.highlightedText].sort((a, b) => {
      return paragraph.content.indexOf(a.text) - paragraph.content.indexOf(b.text);
    });
    
    for (const highlight of sortedHighlights) {
      const index = paragraph.content.indexOf(highlight.text, lastIndex);
      if (index === -1) continue;
      
      // Add text before the highlight
      if (index > lastIndex) {
        result.push(paragraph.content.substring(lastIndex, index));
      }
      
      // Add the highlighted text
      result.push(
        <span key={index} className={highlight.className || "text-blue-500"}>
          {highlight.text}
        </span>
      );
      
      lastIndex = index + highlight.text.length;
    }
    
    // Add any remaining text
    if (lastIndex < paragraph.content.length) {
      result.push(paragraph.content.substring(lastIndex));
    }
    
    return result;
  };

  return (
    <section className={className}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-6 text-center">{title}</h3>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-gray-600 mb-6">
              {renderParagraphWithHighlights(paragraph)}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;