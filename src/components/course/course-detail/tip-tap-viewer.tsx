import { FC, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface TiptapViewerProps {
  content: string;
  className?: string;
}

export const TiptapViewer: FC<TiptapViewerProps> = ({
  content,
  className = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: content,
    editable: false,
    editorProps: {
      attributes: {
        // Thêm 'prose-ul:list-disc prose-ol:list-decimal' để ép Tailwind hiện list
        // Thêm 'marker:text-foreground' để đảm bảo màu của dấu chấm hiển thị rõ
        class: `prose prose-sm max-w-none focus:outline-none prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-primary ${className}`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-viewer-container">
      <EditorContent editor={editor} />
    </div>
  );
};
