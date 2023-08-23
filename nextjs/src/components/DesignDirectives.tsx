import { CodeComponent } from "@/components";
import { ClipboardIcon } from "@heroicons/react/24/solid";
import { Field } from "formik";
import React, { FC, HTMLAttributes, useState } from "react";

import { CopyToClipboard } from "react-copy-to-clipboard";
import ReactMarkdown from "react-markdown";

interface DesignDirectivesProps {
  text: string;
}

const components = {
  code: CodeComponent,
  h2: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-bold mt-5 text-lg" {...props} />
  ),
  h3: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-bold mt-5" {...props} />
  ),
  p: ({ ...props }: HTMLAttributes<HTMLHeadingElement>) => (
    <p className="mt-5" {...props} />
  ),
};

export const DesignDirectives: FC<DesignDirectivesProps> = ({ text }) => {
  const [isEditable, setIsEditable] = useState(false);

  // const textForTokenCount = data?.payload || "";

  return text ? (
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
              value={text}
              // onChange={(e: any) => {
              //   setFieldValue("design_instructions", e.target.value);
              // }}
            />
          </div>
        ) : (
          <ReactMarkdown
            components={components}
            // rehypePlugins={[rehypeRaw]}
            className="ml-0 p-4 overflow-y-auto bg-slate-300 text-slate-500 rounded-md max-h-[1000px]"
          >
            {text}
          </ReactMarkdown>
        )}

        <div className="p-2">
          <CopyToClipboard text={text}>
            <button
              className="text-sm font-semibold leading-6 text-black flex items-center cursor-pointer"
              type="button"
              onClick={() => alert("All content copied to clipboard!")}
            >
              <ClipboardIcon className="h-5 w-5 mr-2" />
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
          {/* <TokenCounter
            textForTokenCount={textForTokenCount}
            llm_vendor_for_instructions={values.llm_vendor_for_instructions}
          /> */}
        </div>
      </>
    </details>
  ) : null;
};

export default React.memo(DesignDirectives);
