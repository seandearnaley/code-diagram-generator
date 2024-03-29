import { ClipboardIcon } from "@heroicons/react/24/solid";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CodeProps } from "react-markdown/lib/ast-to-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

type CustomCodeProps = CodeProps & {
  children: React.ReactNode;
};

export const CodeComponent: React.FC<CustomCodeProps> = ({
  inline,
  className,
  children,
}) => {
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children);

  const handleCopyClick = () => {
    alert("Code copied to clipboard!");
  };

  if (inline) {
    return <code>{children}</code>;
  }

  return (
    <div className="prose overflow-y-auto bg-slate-500 text-slate-500 rounded-md mt-5 mb-5 max-w-[100vw]">
      <pre className="max-h-[500px] m-0">
        {match ? (
          <SyntaxHighlighter
            style={tomorrow}
            language={match[1] || ""}
            PreTag="div"
          >
            {codeString}
          </SyntaxHighlighter>
        ) : (
          children
        )}
      </pre>
      <CopyToClipboard text={codeString}>
        <button
          className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer p-2"
          type="button"
          onClick={handleCopyClick}
        >
          <ClipboardIcon className="h-5 w-5 mr-2" />
          Copy
        </button>
      </CopyToClipboard>
    </div>
  );
};
