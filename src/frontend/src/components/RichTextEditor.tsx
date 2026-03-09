import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
}

const MODULES_BASE = {
  toolbar: {
    container: [
      [{ align: ["", "center", "right", "justify"] }],
      ["bold", "italic", "underline"],
      ["link"],
      ["clean"],
    ],
  },
};

const FORMATS = ["align", "bold", "italic", "underline", "link"];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  "data-ocid": dataOcid,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const savedRange = useRef<{ index: number; length: number } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<"external" | "wiki">("external");
  const [externalUrl, setExternalUrl] = useState("");
  const [wikiTitle, setWikiTitle] = useState("");

  const openLinkDialog = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection();
    savedRange.current = range ?? { index: 0, length: 0 };
    setLinkType("external");
    setExternalUrl("");
    setWikiTitle("");
    setDialogOpen(true);
  }, []);

  const handleInsert = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !savedRange.current) return;
    const href =
      linkType === "wiki"
        ? `/page-link/${encodeURIComponent(wikiTitle.trim())}`
        : externalUrl.startsWith("http")
          ? externalUrl
          : `https://${externalUrl}`;
    quill.setSelection(savedRange.current.index, savedRange.current.length);
    quill.format("link", href);
    setDialogOpen(false);
  }, [linkType, externalUrl, wikiTitle]);

  const modules = {
    ...MODULES_BASE,
    toolbar: {
      ...MODULES_BASE.toolbar,
      handlers: { link: openLinkDialog },
    },
  };

  return (
    <>
      <div className="rich-editor-wrapper" data-ocid={dataOcid}>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={FORMATS}
          placeholder={placeholder}
          theme="snow"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="link.dialog">
          <DialogHeader>
            <DialogTitle className="font-serif">Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={linkType === "external" ? "default" : "outline"}
                onClick={() => setLinkType("external")}
                className="font-body"
                data-ocid="link.external_tab"
              >
                External URL
              </Button>
              <Button
                size="sm"
                variant={linkType === "wiki" ? "default" : "outline"}
                onClick={() => setLinkType("wiki")}
                className="font-body"
                data-ocid="link.wiki_tab"
              >
                Wiki Page
              </Button>
            </div>
            {linkType === "external" ? (
              <div>
                <Label className="font-body text-sm text-muted-foreground mb-1.5 block">
                  URL
                </Label>
                <Input
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="font-body"
                  autoFocus
                  data-ocid="link.url_input"
                  onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                />
              </div>
            ) : (
              <div>
                <Label className="font-body text-sm text-muted-foreground mb-1.5 block">
                  Page Title
                </Label>
                <Input
                  value={wikiTitle}
                  onChange={(e) => setWikiTitle(e.target.value)}
                  placeholder="e.g. Clay Soil"
                  className="font-body"
                  autoFocus
                  data-ocid="link.wiki_input"
                  onKeyDown={(e) => e.key === "Enter" && handleInsert()}
                />
                <p className="mt-1.5 text-xs text-muted-foreground font-body">
                  Links to another page in this wiki by its exact title.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="font-body"
              data-ocid="link.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              className="font-body"
              data-ocid="link.insert_button"
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
