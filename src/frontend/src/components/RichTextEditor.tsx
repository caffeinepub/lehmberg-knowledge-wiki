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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "data-ocid"?: string;
}

type WrapMode = "inline" | "float-left" | "float-right";

interface ResizeState {
  img: HTMLImageElement;
  startX: number;
  startWidth: number;
  corner: string;
}

const MODULES_BASE = {
  toolbar: {
    container: [
      [{ align: ["", "center", "right", "justify"] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  },
};

const FORMATS = [
  "align",
  "bold",
  "italic",
  "underline",
  "list",
  "link",
  "image",
];

function imageStyle(wrap: WrapMode, widthPct: number): string {
  if (wrap === "float-left")
    return `float:left; margin:0 12px 8px 0; max-width:50%; width:${widthPct}%;`;
  if (wrap === "float-right")
    return `float:right; margin:0 0 8px 12px; max-width:50%; width:${widthPct}%;`;
  return `display:block; max-width:100%; margin:8px auto; width:${widthPct}%;`;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  "data-ocid": dataOcid,
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const savedRange = useRef<{ index: number; length: number } | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const { actor } = useActor();
  const queryClient = useQueryClient();

  // Link dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<"external" | "wiki">("wiki");
  const [externalUrl, setExternalUrl] = useState("");
  const [wikiTitle, setWikiTitle] = useState("");
  const [isCreatingPage, setIsCreatingPage] = useState(false);

  // Image dialog
  const [imgDialogOpen, setImgDialogOpen] = useState(false);
  const [imgTab, setImgTab] = useState<"upload" | "url">("upload");
  const [imgUrl, setImgUrl] = useState("");
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [imgWrap, setImgWrap] = useState<WrapMode>("inline");

  // Resize overlay
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [imgRect, setImgRect] = useState<DOMRect | null>(null);
  const resizeState = useRef<ResizeState | null>(null);

  // ── Link handlers ─────────────────────────────────────────────────────────

  const openLinkDialog = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection();
    savedRange.current = range ?? { index: 0, length: 0 };
    setLinkType("wiki");
    setExternalUrl("");
    setWikiTitle("");
    setDialogOpen(true);
  }, []);

  const handleInsert = useCallback(async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !savedRange.current) return;

    if (linkType === "wiki") {
      const title = wikiTitle.trim();
      if (title && actor) {
        setIsCreatingPage(true);
        try {
          const existing = await actor.getPageByTitle(title);
          if (!existing) {
            await actor.createPage(title, "", []);
            queryClient.invalidateQueries({ queryKey: ["pages"] });
          }
        } catch {
          // silently proceed even if creation fails
        } finally {
          setIsCreatingPage(false);
        }
      }
      const href = `/page-link/${encodeURIComponent(title)}`;
      quill.setSelection(savedRange.current.index, savedRange.current.length);
      quill.format("link", href);
    } else {
      const href = externalUrl.startsWith("http")
        ? externalUrl
        : `https://${externalUrl}`;
      quill.setSelection(savedRange.current.index, savedRange.current.length);
      quill.format("link", href);
    }

    setDialogOpen(false);
  }, [linkType, externalUrl, wikiTitle, actor, queryClient]);

  // ── Image handlers ────────────────────────────────────────────────────────

  const openImageDialog = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection();
    savedRange.current = range ?? { index: quill.getLength() - 1, length: 0 };
    setImgTab("upload");
    setImgUrl("");
    setImgFile(null);
    setImgWrap("inline");
    setImgDialogOpen(true);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImgFile(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleInsertImage = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill || !savedRange.current) return;
    const src = imgTab === "upload" ? imgFile : imgUrl;
    if (!src) return;
    const widthPct = imgWrap === "inline" ? 100 : 40;
    const style = imageStyle(imgWrap, widthPct);
    const index = savedRange.current.index;
    (quill as any).clipboard.dangerouslyPasteHTML(
      index,
      `<img src="${src}" style="${style}" alt="" />`,
    );
    setImgDialogOpen(false);
  }, [imgTab, imgFile, imgUrl, imgWrap]);

  // ── Image click / resize ──────────────────────────────────────────────────

  const updateImgRect = useCallback((img: HTMLImageElement) => {
    const container = editorContainerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const imgRectAbs = img.getBoundingClientRect();
    setImgRect({
      ...imgRectAbs,
      top: imgRectAbs.top - containerRect.top,
      left: imgRectAbs.left - containerRect.left,
      bottom: imgRectAbs.bottom - containerRect.top,
      right: imgRectAbs.right - containerRect.left,
      width: imgRectAbs.width,
      height: imgRectAbs.height,
    } as DOMRect);
  }, []);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && target.closest(".ql-editor")) {
        const img = target as HTMLImageElement;
        setSelectedImg(img);
        updateImgRect(img);
        e.stopPropagation();
        return;
      }
      // Click outside image — deselect (unless on a handle)
      if (!(target as HTMLElement).closest(".img-resize-handle")) {
        setSelectedImg(null);
        setImgRect(null);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedImg(null);
        setImgRect(null);
      }
    };

    container.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      container.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [updateImgRect]);

  // Resize drag
  const onHandleMouseDown = useCallback(
    (e: React.MouseEvent, corner: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedImg) return;
      resizeState.current = {
        img: selectedImg,
        startX: e.clientX,
        startWidth: selectedImg.getBoundingClientRect().width,
        corner,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizeState.current) return;
        const { img, startX, startWidth, corner: c } = resizeState.current;
        const dx =
          c === "se" || c === "ne" ? ev.clientX - startX : startX - ev.clientX;
        const newWidth = Math.max(40, startWidth + dx);
        img.style.width = `${newWidth}px`;
        img.style.maxWidth = "none";
        updateImgRect(img);
      };

      const onMouseUp = () => {
        resizeState.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [selectedImg, updateImgRect],
  );

  const modules = {
    ...MODULES_BASE,
    toolbar: {
      ...MODULES_BASE.toolbar,
      handlers: { link: openLinkDialog, image: openImageDialog },
    },
  };

  const corners = [
    { id: "nw", style: { top: -5, left: -5, cursor: "nw-resize" } },
    { id: "ne", style: { top: -5, right: -5, cursor: "ne-resize" } },
    { id: "sw", style: { bottom: -5, left: -5, cursor: "sw-resize" } },
    { id: "se", style: { bottom: -5, right: -5, cursor: "se-resize" } },
  ] as const;

  return (
    <>
      <div
        className="rich-editor-wrapper"
        data-ocid={dataOcid}
        ref={editorContainerRef}
        style={{ position: "relative" }}
      >
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          modules={modules}
          formats={FORMATS}
          placeholder={placeholder}
          theme="snow"
        />

        {/* Resize overlay */}
        {selectedImg && imgRect && (
          <div
            style={{
              position: "absolute",
              top: imgRect.top,
              left: imgRect.left,
              width: imgRect.width,
              height: imgRect.height,
              border: "2px solid oklch(0.36 0.09 155)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {corners.map((c) => (
              <div
                key={c.id}
                className="img-resize-handle"
                style={{
                  position: "absolute",
                  width: 10,
                  height: 10,
                  background: "oklch(0.36 0.09 155)",
                  border: "2px solid white",
                  borderRadius: 2,
                  pointerEvents: "all",
                  ...c.style,
                }}
                onMouseDown={(e) => onHandleMouseDown(e, c.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Link Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="link.dialog">
          <DialogHeader>
            <DialogTitle className="font-serif">Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={linkType === "wiki" ? "default" : "outline"}
                onClick={() => setLinkType("wiki")}
                className="font-body"
                data-ocid="link.wiki_tab"
              >
                Wiki Page
              </Button>
              <Button
                size="sm"
                variant={linkType === "external" ? "default" : "outline"}
                onClick={() => setLinkType("external")}
                className="font-body"
                data-ocid="link.external_tab"
              >
                External URL
              </Button>
            </div>
            {linkType === "wiki" ? (
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
                  Links to a wiki page by title. If the page doesn&apos;t exist
                  yet, it will be created automatically.
                </p>
              </div>
            ) : (
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
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="font-body"
              data-ocid="link.cancel_button"
              disabled={isCreatingPage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              className="font-body"
              data-ocid="link.insert_button"
              disabled={isCreatingPage}
            >
              {isCreatingPage ? "Creating page…" : "Insert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Image Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={imgDialogOpen} onOpenChange={setImgDialogOpen}>
        <DialogContent data-ocid="image.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Image size={18} className="text-primary" />
              Insert Image
            </DialogTitle>
          </DialogHeader>

          <Tabs
            value={imgTab}
            onValueChange={(v) => setImgTab(v as "upload" | "url")}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="upload" className="flex-1 font-body">
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1 font-body">
                From URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4 space-y-3">
              <Label className="font-body text-sm text-muted-foreground block">
                Choose an image file
              </Label>
              <label
                className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-md py-6 px-4 cursor-pointer hover:border-primary/60 hover:bg-accent/30 transition-colors"
                data-ocid="image.dropzone"
              >
                <Image size={28} className="text-muted-foreground" />
                <span className="text-sm font-body text-muted-foreground">
                  {imgFile ? "Image selected ✓" : "Click to browse…"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  data-ocid="image.upload_button"
                />
              </label>
              {imgFile && (
                <img
                  src={imgFile}
                  alt="preview"
                  className="max-h-32 rounded border border-border object-contain mx-auto block"
                />
              )}
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-3">
              <Label className="font-body text-sm text-muted-foreground block">
                Image URL
              </Label>
              <Input
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="font-body"
                autoFocus
                data-ocid="image.url_input"
              />
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt="preview"
                  className="max-h-32 rounded border border-border object-contain mx-auto block"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-4 space-y-2">
            <Label className="font-body text-sm text-muted-foreground block">
              Text wrapping
            </Label>
            <Select
              value={imgWrap}
              onValueChange={(v) => setImgWrap(v as WrapMode)}
            >
              <SelectTrigger
                className="font-body"
                data-ocid="image.wrap_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inline" className="font-body">
                  Inline — no wrapping
                </SelectItem>
                <SelectItem value="float-left" className="font-body">
                  Float left — text wraps right
                </SelectItem>
                <SelectItem value="float-right" className="font-body">
                  Float right — text wraps left
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setImgDialogOpen(false)}
              className="font-body"
              data-ocid="image.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInsertImage}
              disabled={imgTab === "upload" ? !imgFile : !imgUrl}
              className="font-body"
              data-ocid="image.insert_button"
            >
              Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
