"use client";

import * as React from "react";
import { Stamp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TEMPLATE_OPTIONS,
  type LicenseFormState,
  type LicenseTemplate,
  type StampDebugConfig,
  type TemplateKey,
  type TextStyleConfig,
} from "@/lib/license-templates";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  form: LicenseFormState;
  currentConfig: LicenseTemplate;
  currentTemplateKey: TemplateKey;
  onTemplateSwitch: (key: TemplateKey) => void;
  onDateFoundChange: (value: string) => void;
  onFormFieldChange: <Key extends keyof LicenseFormState>(
    key: Key,
    value: LicenseFormState[Key],
  ) => void;
  onStampFieldChange: <Key extends keyof StampDebugConfig>(
    key: Key,
    value: StampDebugConfig[Key],
  ) => void;
  onStyleFieldChange: <Key extends keyof TextStyleConfig>(
    key: Key,
    value: TextStyleConfig[Key],
  ) => void;
};

function parseNumericInput(
  value: string,
  fallback: number,
  min: number,
  max: number,
) {
  if (value.trim() === "") {
    return fallback;
  }

  const nextValue = Number(value);

  if (Number.isNaN(nextValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, nextValue));
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: FieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-sidebar-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 border-sidebar-border bg-background/90 text-sidebar-foreground shadow-none focus-visible:border-sidebar-primary focus-visible:ring-sidebar-ring/40"
      />
    </div>
  );
}

type TextAreaFieldProps = FieldProps & {
  rows?: number;
};

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-sidebar-foreground">
        {label}
      </Label>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 border-sidebar-border bg-background/90 text-sidebar-foreground shadow-none focus-visible:border-sidebar-primary focus-visible:ring-sidebar-ring/40"
      />
    </div>
  );
}

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: SliderFieldProps) {
  return (
    <div className="grid gap-3 rounded-md border border-sidebar-border/60 bg-background/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="text-sm font-medium text-sidebar-foreground">
          {label}
        </Label>
        <Input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) =>
            onChange(parseNumericInput(event.target.value, value, min, max))
          }
          className="h-8 w-24 border-sidebar-border bg-background text-left tabular-nums shadow-none"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) =>
          onChange(Array.isArray(values) ? (values[0] ?? value) : values)
        }
      />
    </div>
  );
}

type NumberFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: NumberFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-sidebar-border/60 bg-background/70 p-3">
      <Label className="text-sm font-medium text-sidebar-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) =>
          onChange(parseNumericInput(event.target.value, value, min, max))
        }
        className="h-8 w-24 border-sidebar-border bg-background text-left tabular-nums shadow-none"
      />
    </div>
  );
}

type SwitchFieldProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function SwitchField({ label, checked, onChange }: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-sidebar-border/60 bg-background/70 p-3">
      <Label className="text-sm font-medium text-sidebar-foreground">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-sm font-semibold tracking-[0.08em] text-sidebar-foreground">
      {children}
    </div>
  );
}

export function AppSidebar({
  form,
  currentConfig,
  currentTemplateKey,
  onTemplateSwitch,
  onDateFoundChange,
  onFormFieldChange,
  onStampFieldChange,
  onStyleFieldChange,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar
      className="border-r border-sidebar-border/70"
      {...props}
    >
      <SidebarHeader className="border-b border-sidebar-border/70 p-0">
        <div className="flex h-16 items-center gap-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Stamp className="size-4" />
            </div>
            <div className="text-xl leading-none font-semibold text-sidebar-foreground">
              参数配置
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="soft-scrollbar">
        <SidebarGroup className="gap-5 px-4 py-4">
          <SectionTitle>企业信息</SectionTitle>
          <div className="grid gap-4">
            <Field
              id="name"
              label="企业名称"
              value={form.name}
              placeholder="请输入企业全称"
              onChange={(value) => onFormFieldChange("name", value)}
            />
            <Field
              id="code"
              label="信用代码"
              value={form.code}
              placeholder="91xxxxxxxxxxxxxx"
              onChange={(value) => onFormFieldChange("code", value)}
            />
            <div className="grid gap-4 xl:grid-cols-2">
              <Field
                id="type"
                label="企业类型"
                value={form.type}
                onChange={(value) => onFormFieldChange("type", value)}
              />
              <Field
                id="rep"
                label="法定代表人"
                value={form.rep}
                onChange={(value) => onFormFieldChange("rep", value)}
              />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Field
                id="capital"
                label="注册资本"
                value={form.capital}
                placeholder="例如：壹佰万元整"
                onChange={(value) => onFormFieldChange("capital", value)}
              />
              <Field
                id="term"
                label="营业期限"
                value={form.term}
                onChange={(value) => onFormFieldChange("term", value)}
              />
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              <Field
                id="date-found"
                label="成立日期"
                value={form.date_found}
                placeholder="2024年01月01日"
                onChange={onDateFoundChange}
              />
              <Field
                id="date-register"
                label="登记日期"
                value={form.date_register}
                onChange={(value) => onFormFieldChange("date_register", value)}
              />
            </div>
            <TextAreaField
              id="address"
              label="住所"
              value={form.address}
              rows={3}
              onChange={(value) => onFormFieldChange("address", value)}
            />
            <TextAreaField
              id="scope"
              label="经营范围"
              value={form.scope}
              rows={4}
              onChange={(value) => onFormFieldChange("scope", value)}
            />
          </div>

          <Separator className="bg-sidebar-border/70" />

          <SectionTitle>印章信息</SectionTitle>
          <div className="grid gap-4">
            <Field
              id="stamp-org"
              label="印章文字"
              value={form.stamp_org}
              placeholder="例如：北京市市场监督管理局"
              onChange={(value) => onFormFieldChange("stamp_org", value)}
            />
            <Field
              id="stamp-code"
              label="印章编码"
              value={form.stamp_code}
              placeholder="13 位数字（选填）"
              onChange={(value) => onFormFieldChange("stamp_code", value)}
            />
            <SliderField
              label="五角星大小"
              value={currentConfig.stampDebug.starSize}
              min={0.1}
              max={0.6}
              step={0.01}
              onChange={(value) => onStampFieldChange("starSize", value)}
            />
            <SliderField
              label="名字字号"
              value={currentConfig.stampDebug.orgSize}
              min={0.1}
              max={0.3}
              step={0.01}
              onChange={(value) => onStampFieldChange("orgSize", value)}
            />
            <SliderField
              label="名字高度"
              value={currentConfig.stampDebug.orgHeight}
              min={0.8}
              max={2.5}
              step={0.1}
              onChange={(value) => onStampFieldChange("orgHeight", value)}
            />
            <SliderField
              label="名字拉伸"
              value={currentConfig.stampDebug.orgStretch}
              min={0.3}
              max={1}
              step={0.05}
              onChange={(value) => onStampFieldChange("orgStretch", value)}
            />
            <SliderField
              label="文字分布"
              value={currentConfig.stampDebug.orgDistribution}
              min={0.5}
              max={1}
              step={0.05}
              onChange={(value) => onStampFieldChange("orgDistribution", value)}
            />
            <SliderField
              label="编码分布"
              value={currentConfig.stampDebug.codeDistribution}
              min={0.8}
              max={2}
              step={0.05}
              onChange={(value) => onStampFieldChange("codeDistribution", value)}
            />
          </div>

          <Separator className="bg-sidebar-border/70" />

          <SectionTitle>模板布局</SectionTitle>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_OPTIONS.map((option) => (
                <Button
                  key={option.key}
                  variant={currentTemplateKey === option.key ? "default" : "outline"}
                  className={cn(
                    "h-9 rounded-md",
                    currentTemplateKey === option.key
                      ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                      : "border-sidebar-border bg-background/70 text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                  onClick={() => onTemplateSwitch(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <SliderField
              label="水平 X"
              value={currentConfig.stampDebug.x}
              min={0}
              max={4000}
              step={10}
              onChange={(value) => onStampFieldChange("x", value)}
            />
            <SliderField
              label="垂直 Y"
              value={currentConfig.stampDebug.y}
              min={0}
              max={3000}
              step={10}
              onChange={(value) => onStampFieldChange("y", value)}
            />
            <SliderField
              label="印章尺寸"
              value={currentConfig.stampDebug.size}
              min={100}
              max={1000}
              step={10}
              onChange={(value) => onStampFieldChange("size", value)}
            />
          </div>

          <Separator className="bg-sidebar-border/70" />

          <SectionTitle>字体设置</SectionTitle>
          <div className="grid gap-4">
            <SwitchField
              label="整体加粗"
              checked={currentConfig.stampDebug.enablePostBold}
              onChange={(value) => onStampFieldChange("enablePostBold", value)}
            />
            <SwitchField
              label="加粗噪点"
              checked={currentConfig.stampDebug.enableBoldNoise}
              onChange={(value) => onStampFieldChange("enableBoldNoise", value)}
            />
            {currentConfig.stampDebug.enablePostBold ? (
              <SliderField
                label="加粗程度"
                value={currentConfig.stampDebug.postBoldStrength}
                min={0}
                max={3}
                step={0.5}
                onChange={(value) => onStampFieldChange("postBoldStrength", value)}
              />
            ) : null}
            {currentConfig.stampDebug.enableBoldNoise ? (
              <SliderField
                label="噪点强度"
                value={currentConfig.stampDebug.boldNoiseStrength}
                min={10}
                max={100}
                step={1}
                onChange={(value) => onStampFieldChange("boldNoiseStrength", value)}
              />
            ) : null}
            <NumberField
              label="名称字号"
              value={currentConfig.style.titleFontSize}
              min={30}
              max={100}
              onChange={(value) => onStyleFieldChange("titleFontSize", value)}
            />
            <NumberField
              label="正文字号"
              value={currentConfig.style.fontSize}
              min={20}
              max={100}
              onChange={(value) => onStyleFieldChange("fontSize", value)}
            />
            <NumberField
              label="范围字号"
              value={currentConfig.style.scopeFontSize}
              min={20}
              max={100}
              onChange={(value) => onStyleFieldChange("scopeFontSize", value)}
            />
            <NumberField
              label="范围行高"
              value={currentConfig.style.scopeLineHeight}
              min={30}
              max={150}
              onChange={(value) => onStyleFieldChange("scopeLineHeight", value)}
            />
            <SwitchField
              label="全局加粗"
              checked={currentConfig.style.isBold}
              onChange={(value) => onStyleFieldChange("isBold", value)}
            />
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
