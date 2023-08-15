import { CodeComponent, MermaidDiagram } from "@/components";
import { Field } from "formik";
import { HTMLAttributes } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface DesignDirectivesProps {
  design_directive_data: any;
  isLoading: boolean | null;
  isEditable: boolean;
  setIsEditable: any;
  setFieldValue: any;
  tokenCountInfo: any;
}

const components = {
  code: CodeComponent,
  h2: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-bold mt-5 text-lg" {...props} />
  ),
  h3: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-bold mt-5" {...props} />
  ),
};

export const DesignDirectives: React.FC<DesignDirectivesProps> = ({
  design_directive_data,
  isLoading,
  isEditable,
  setIsEditable,
  setFieldValue,
  tokenCountInfo,
}) => {
  return design_directive_data &&
    design_directive_data.payload &&
    !isLoading ? (
    <details open className="mb-4">
      <summary className="cursor-pointer text-lg font-medium text-gray-700">
        Design Directives
      </summary>
      <>
        <p className="mt-1 text-sm leading-6 text-gray-600  border-gray-900/10 p-4">
          This will be used to generate design instructions, which will then be
          used to generate the diagram. Spreading out the design instructions
          over multiple lines will help the model generate more coherent
          instructions.
        </p>

        {isEditable ? (
          <div>
            <Field
              as="textarea"
              name="design_instructions"
              className="ml-0 p-4 overflow-y-auto bg-slate-300 text-slate-500 rounded-md resize-none w-full max-h-[1000px] h-[1000px]"
              value={design_directive_data.payload}
              onChange={(e: any) => {
                setFieldValue("design_instructions", e.target.value);
              }}
            />
          </div>
        ) : (
          <ReactMarkdown
            components={components}
            rehypePlugins={[rehypeRaw]}
            className="ml-0 p-4 overflow-y-auto bg-slate-300 text-slate-500 rounded-md max-h-[1000px]"
          >
            {design_directive_data.payload}
          </ReactMarkdown>
        )}

        <div className="p-2">
          <CopyToClipboard text={design_directive_data.payload}>
            <button
              className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer"
              type="button"
              onClick={() => alert("All content copied to clipboard!")}
            >
              Copy All Content
            </button>
          </CopyToClipboard>
          <button
            className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer border-2 border-slate-300 rounded-md p-2 bg-slate-200 mt-2"
            type="button"
            onClick={() => setIsEditable(!isEditable)}
          >
            Toggle Edit Mode
          </button>
          {tokenCountInfo && (
            <p className="text-sm p-4">
              Tokens: {tokenCountInfo.token_count}, Estimated Words:{" "}
              {tokenCountInfo.est_words}
            </p>
          )}
        </div>

        <div className="p-2 flex flex-col items-center">
          <MermaidDiagram />
        </div>
      </>
    </details>
  ) : null;
};
