"use client";

import QRCode from "qrcode";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { FileImage, FileText, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  DEFAULT_FORM,
  TEMPLATE_OPTIONS,
  cloneDefaultTemplates,
  normalizeSavedTemplates,
  type LicenseFormState,
  type StampDebugConfig,
  type TemplateKey,
  type TemplatesConfig,
  type TextStyleConfig,
} from "@/lib/license-templates";
import {
  downloadCanvasAsImage,
  downloadCanvasAsPdf,
  loadImage,
  renderLicenseCanvas,
} from "@/lib/license-renderer";

const TEMPLATE_STORAGE_KEY = "wk_templates_config_v2";
const MODE_STORAGE_KEY = "wk_current_mode";
const QR_PREFIX = "https://www.gsxt.gov.cn/index.html?uniscid=";

function buildDownloadBaseName(name: string) {
  const safeName = name.trim() || "未命名";
  return `营业执照_${safeName}`;
}

async function getCachedImage(
  cache: Record<string, HTMLImageElement>,
  src: string,
) {
  if (cache[src]) {
    return cache[src];
  }

  const image = await loadImage(src);
  cache[src] = image;
  return image;
}

export function LicenseStudio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const qrDebounceTimerRef = useRef<number | null>(null);

  const [templates, setTemplates] = useState<TemplatesConfig>(() =>
    cloneDefaultTemplates(),
  );
  const [currentTemplateKey, setCurrentTemplateKey] =
    useState<TemplateKey>("print");
  const [form, setForm] = useState<LicenseFormState>(DEFAULT_FORM);
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [qrImage, setQrImage] = useState<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const currentConfig = templates[currentTemplateKey];
  const deferredForm = useDeferredValue(form);
  const deferredConfig = useDeferredValue(currentConfig);
  const canExport = Boolean(backgroundImage && isImageLoaded);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      try {
        const savedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
        const nextTemplates = savedTemplates
          ? normalizeSavedTemplates(JSON.parse(savedTemplates))
          : cloneDefaultTemplates();
        const nextMode =
          savedMode &&
          TEMPLATE_OPTIONS.some((option) => option.key === savedMode)
            ? (savedMode as TemplateKey)
            : "print";

        startTransition(() => {
          setTemplates(nextTemplates);
          setCurrentTemplateKey(nextMode);
          setIsHydrated(true);
        });
      } catch (error) {
        console.error(error);
        toast.error("本地配置读取失败，已回退到默认模板。");
        startTransition(() => {
          setIsHydrated(true);
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  }, [isHydrated, templates]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(MODE_STORAGE_KEY, currentTemplateKey);
  }, [currentTemplateKey, isHydrated]);

  useEffect(() => {
    for (const template of Object.values(templates)) {
      void getCachedImage(imageCacheRef.current, template.bgSrc).catch(() => {
        return undefined;
      });
    }
  }, [templates]);

  useEffect(() => {
    let cancelled = false;

    void getCachedImage(imageCacheRef.current, currentConfig.bgSrc)
      .then((image) => {
        if (cancelled) {
          return;
        }

        setBackgroundImage(image);
        setIsImageLoaded(true);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(error);
        setBackgroundImage(null);
        setIsImageLoaded(true);
        toast.error("背景模板加载失败。");
      });

    return () => {
      cancelled = true;
    };
  }, [currentConfig.bgSrc]);

  useEffect(() => {
    if (qrDebounceTimerRef.current) {
      window.clearTimeout(qrDebounceTimerRef.current);
    }

    if (!form.code.trim()) {
      return;
    }

    qrDebounceTimerRef.current = window.setTimeout(() => {
      void QRCode.toDataURL(`${QR_PREFIX}${form.code}`, {
        margin: 0,
        errorCorrectionLevel: "L",
        color: {
          dark: currentConfig.qrColor,
          light: "#00000000",
        },
      })
        .then((url) => loadImage(url))
        .then((image) => {
          setQrImage(image);
        })
        .catch((error) => {
          console.error(error);
          toast.error("二维码生成失败。");
        });
    }, 300);

    return () => {
      if (qrDebounceTimerRef.current) {
        window.clearTimeout(qrDebounceTimerRef.current);
      }
    };
  }, [currentConfig.qrColor, form.code]);

  const syncCanvasForEffect = useEffectEvent(
    (
      nextForm: LicenseFormState,
      nextConfig: TemplatesConfig[TemplateKey],
      nextQrImage: HTMLImageElement | null,
    ) => {
      if (!canvasRef.current || !backgroundImage) {
        return;
      }

      renderLicenseCanvas({
        canvas: canvasRef.current,
        backgroundImage,
        qrImage: nextQrImage,
        form: nextForm,
        config: nextConfig,
      });
    },
  );

  useEffect(() => {
    syncCanvasForEffect(
      deferredForm,
      deferredConfig,
      deferredForm.code.trim() ? qrImage : null,
    );
  }, [backgroundImage, deferredConfig, deferredForm, qrImage]);

  function setFormField<Key extends keyof LicenseFormState>(
    key: Key,
    value: LicenseFormState[Key],
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function setDateFound(value: string) {
    setForm((previous) => ({
      ...previous,
      date_found: value,
      date_register: value,
    }));
  }

  function setStampField<Key extends keyof StampDebugConfig>(
    key: Key,
    value: StampDebugConfig[Key],
  ) {
    setTemplates((previous) => ({
      ...previous,
      [currentTemplateKey]: {
        ...previous[currentTemplateKey],
        stampDebug: {
          ...previous[currentTemplateKey].stampDebug,
          [key]: value,
        },
      },
    }));
  }

  function setStyleField<Key extends keyof TextStyleConfig>(
    key: Key,
    value: TextStyleConfig[Key],
  ) {
    setTemplates((previous) => ({
      ...previous,
      [currentTemplateKey]: {
        ...previous[currentTemplateKey],
        style: {
          ...previous[currentTemplateKey].style,
          [key]: value,
        },
      },
    }));
  }

  function handleTemplateSwitch(key: TemplateKey) {
    if (key === currentTemplateKey) {
      return;
    }

    setIsImageLoaded(false);
    setCurrentTemplateKey(key);
  }

  function renderCanvasImmediately(
    nextForm = form,
    nextConfig = currentConfig,
  ) {
    if (!canvasRef.current || !backgroundImage) {
      return false;
    }

    renderLicenseCanvas({
      canvas: canvasRef.current,
      backgroundImage,
      qrImage: nextForm.code.trim() ? qrImage : null,
      form: nextForm,
      config: nextConfig,
    });

    return true;
  }

  function ensureFreshCanvas() {
    if (!backgroundImage) {
      return false;
    }

    return renderCanvasImmediately();
  }

  function handleDownloadImage() {
    if (!canvasRef.current || !ensureFreshCanvas()) {
      toast.error("预览尚未准备好。");
      return;
    }

    setIsDownloading(true);

    try {
      downloadCanvasAsImage(
        canvasRef.current,
        `${buildDownloadBaseName(form.name)}.jpg`,
      );
      toast.success("图片导出成功。");
    } catch (error) {
      console.error(error);
      toast.error("图片导出失败，请重试。");
    } finally {
      setIsDownloading(false);
    }
  }

  function handleDownloadPdf() {
    if (!canvasRef.current || !ensureFreshCanvas()) {
      toast.error("预览尚未准备好。");
      return;
    }

    setIsDownloading(true);

    try {
      downloadCanvasAsPdf(
        canvasRef.current,
        `${buildDownloadBaseName(form.name)}.pdf`,
      );
      toast.success("PDF 导出成功。");
    } catch (error) {
      console.error(error);
      toast.error("PDF 导出失败，请重试。");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "31rem",
            "--sidebar-width-icon": "3.35rem",
          } as CSSProperties
        }
      >
        <AppSidebar
          form={form}
          currentConfig={currentConfig}
          currentTemplateKey={currentTemplateKey}
          onTemplateSwitch={handleTemplateSwitch}
          onDateFoundChange={setDateFound}
          onFormFieldChange={setFormField}
          onStampFieldChange={setStampField}
          onStyleFieldChange={setStyleField}
        />

        <SidebarInset className="bg-sidebar">
          <header className="sticky top-0 z-20 h-16 border-b border-border bg-sidebar">
            <div className="flex h-full items-center gap-3 px-4 md:px-6">
              <SidebarTrigger className="rounded-md border border-border bg-background text-foreground hover:bg-muted" />

              <div className="min-w-0 flex-1">
                <h1 className="truncate font-[var(--font-heading)] text-xl leading-none text-foreground">
                  营业执照生成工作台
                </h1>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDownloadImage}
                  disabled={!canExport || isDownloading}
                  className="h-9 rounded-md border-border bg-background text-foreground hover:bg-muted"
                >
                  {isDownloading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <FileImage className="size-4" />
                  )}
                  导出图片
                </Button>
                <Button
                  onClick={handleDownloadPdf}
                  disabled={!canExport || isDownloading}
                  className="h-9 rounded-md bg-foreground text-background hover:bg-foreground/85"
                >
                  {isDownloading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  导出 PDF
                </Button>
              </div>
            </div>
          </header>

          <section className="flex flex-1 items-center justify-center p-3 md:p-5 xl:p-8">
            <div className="relative flex min-h-[calc(100svh-8.5rem)] w-full max-w-[1700px] flex-1 items-center justify-center">
              {!isImageLoaded ? (
                <div className="absolute inset-0 z-10 grid place-items-center bg-sidebar/72">
                  <div className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm">
                    <LoaderCircle className="size-4 animate-spin text-foreground" />
                    正在加载模板资源...
                  </div>
                </div>
              ) : null}

              <div className="relative flex h-full w-full items-center justify-center overflow-auto">
                <div className="flex min-h-full min-w-full items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    className="block h-auto max-w-full"
                  />
                </div>
              </div>
            </div>
          </section>
        </SidebarInset>
      </SidebarProvider>

    </div>
  );
}
