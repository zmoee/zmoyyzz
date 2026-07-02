import { jsPDF } from "jspdf";

import type {
  LicenseFormState,
  LicenseTemplate,
} from "@/lib/license-templates";

type RenderLicenseOptions = {
  canvas: HTMLCanvasElement;
  backgroundImage: HTMLImageElement;
  qrImage: HTMLImageElement | null;
  form: LicenseFormState;
  config: LicenseTemplate;
};

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export function renderLicenseCanvas({
  canvas,
  backgroundImage,
  qrImage,
  form,
  config,
}: RenderLicenseOptions) {
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  canvas.width = backgroundImage.width;
  canvas.height = backgroundImage.height;

  renderToContext(ctx, backgroundImage, qrImage, form, config);
}

export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement,
  fileName: string,
) {
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCanvasAsPdf(
  canvas: HTMLCanvasElement,
  fileName: string,
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  doc.addImage(imgData, "JPEG", 0, 0, 297, 210);
  doc.save(fileName);
}

function renderToContext(
  ctx: CanvasRenderingContext2D,
  backgroundImage: HTMLImageElement,
  qrImage: HTMLImageElement | null,
  form: LicenseFormState,
  config: LicenseTemplate,
) {
  const { pos, style } = config;

  ctx.clearRect(0, 0, backgroundImage.width, backgroundImage.height);
  ctx.drawImage(backgroundImage, 0, 0);

  if (qrImage) {
    ctx.drawImage(
      qrImage,
      config.qrPos.x,
      config.qrPos.y,
      config.qrPos.size,
      config.qrPos.size,
    );
  }

  if (form.stamp_org) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.95;
    drawHighFidelityStamp(
      ctx,
      config.stampDebug.x,
      config.stampDebug.y,
      config.stampDebug.size,
      form,
      config,
    );
    ctx.restore();
  }

  ctx.textBaseline = "top";
  ctx.fillStyle = config.textColor;

  const getFont = (size: number) =>
    `${style.isBold ? "bold" : "normal"} ${size}px ${style.fontFamily}`;

  ctx.font = getFont(style.codeFontSize);
  ctx.fillText(form.code, pos.code.x, pos.code.y);

  ctx.font = getFont(style.titleFontSize);
  ctx.fillText(form.name, pos.name.x, pos.name.y);

  ctx.font = getFont(style.fontSize);
  ctx.fillText(form.type, pos.type.x, pos.type.y);
  ctx.fillText(form.rep, pos.rep.x, pos.rep.y);
  ctx.fillText(form.capital, pos.capital.x, pos.capital.y);
  ctx.fillText(form.date_found, pos.date_found.x, pos.date_found.y);

  if (pos.term && pos.term.x) {
    ctx.fillText(form.term, pos.term.x, pos.term.y ?? 0);
  }

  wrapText(ctx, form.address, pos.address.x, pos.address.y, 800, style.lineHeight);

  ctx.font = getFont(style.scopeFontSize);
  wrapText(
    ctx,
    form.scope,
    pos.scope.x,
    pos.scope.y,
    style.scopeMaxWidth,
    style.scopeLineHeight,
  );

  ctx.font = getFont(style.fontSize);
  const dateStr = form.date_register || "";
  const match = dateStr.match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);

  if (match) {
    ctx.fillText(match[1], pos.year.x, pos.year.y);
    ctx.fillText(match[2], pos.month.x, pos.month.y);
    ctx.fillText(match[3], pos.day.x, pos.day.y);
  }
}

function drawHighFidelityStamp(
  mainCtx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  form: LicenseFormState,
  config: LicenseTemplate,
) {
  const margin = 20;
  const canvasSize = size + margin * 2;
  const offCanvas = document.createElement("canvas");
  offCanvas.width = canvasSize;
  offCanvas.height = canvasSize;

  const ctx = offCanvas.getContext("2d");

  if (!ctx) {
    return;
  }

  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;
  const radius = size / 2;
  const borderWidth = size * 0.025;
  const color = "rgb(255, 0, 0)";
  const innerRadius = radius - borderWidth;
  const stampConf = config.stampDebug;
  const starSize = stampConf.starSize || 0.3;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = borderWidth;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius - borderWidth / 2, 0, Math.PI * 2);
  ctx.stroke();

  drawStar(ctx, centerX, centerY, (size * starSize) / 2);
  drawSecurityLines(ctx, centerX, centerY, radius - borderWidth / 2, borderWidth, size);

  if (form.stamp_org) {
    const fontSize = size * (stampConf.orgSize || 0.1666);
    const padding = size * 0.0285;
    const textRadius = innerRadius - padding - fontSize / 2;

    drawArcText(
      ctx,
      form.stamp_org,
      centerX,
      centerY,
      textRadius,
      fontSize,
      color,
      stampConf.orgStretch,
      stampConf.orgHeight || 1.0,
      stampConf.orgDistribution,
      false,
      '"SimSun", "STSong", serif',
    );
  }

  if (form.stamp_code) {
    const fontSize = size * 0.0333;
    const padding = size * 0.0261;
    const textRadius = innerRadius - padding - fontSize / 2;

    drawArcText(
      ctx,
      form.stamp_code,
      centerX,
      centerY,
      textRadius,
      fontSize,
      color,
      1.35,
      1.0,
      stampConf.codeDistribution,
      true,
      "Arial, Helvetica, sans-serif",
    );
  }

  ctx.restore();

  applyRealisticEffect(ctx, canvasSize, canvasSize);

  if (stampConf.enablePostBold || stampConf.enableBoldNoise) {
    applyTextureEffects(ctx, canvasSize, canvasSize, stampConf);
  }

  mainCtx.drawImage(offCanvas, cx - centerX, cy - centerY);
}

function applyTextureEffects(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  conf: LicenseTemplate["stampDebug"],
) {
  if (conf.enablePostBold) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;

    const tempCtx = tempCanvas.getContext("2d");

    if (tempCtx) {
      tempCtx.drawImage(ctx.canvas, 0, 0);
      ctx.save();

      const strength = conf.postBoldStrength || 1;
      const steps = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 0.7, y: 0.7 },
        { x: -0.7, y: -0.7 },
      ];

      ctx.globalAlpha = 0.6;

      for (const step of steps) {
        ctx.drawImage(tempCanvas, step.x * strength, step.y * strength);
      }

      ctx.restore();
    }
  }

  if (conf.enableBoldNoise) {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";

    const noiseStrength = conf.boldNoiseStrength;
    const baseParticleCount = noiseStrength * 20;
    const damageCenters: Array<{ x: number; y: number; radius: number }> = [];
    const centerCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < centerCount; i += 1) {
      damageCenters.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 100 + 50,
      });
    }

    ctx.beginPath();

    for (let i = 0; i < baseParticleCount; i += 1) {
      let x = Math.random() * width;
      let y = Math.random() * height;

      if (Math.random() < 0.5) {
        const center = damageCenters[Math.floor(Math.random() * centerCount)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * center.radius;
        x = center.x + Math.cos(angle) * dist;
        y = center.y + Math.sin(angle) * dist;
      }

      const sizeBase = Math.random();
      let radius = 0.5;

      if (sizeBase > 0.95) {
        radius = 2.5 + Math.random();
      } else if (sizeBase > 0.8) {
        radius = 1.5 + Math.random();
      } else {
        radius = 0.5 + Math.random() * 0.5;
      }

      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    }

    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fill();

    if (noiseStrength > 30) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;

      const tempCtx = tempCanvas.getContext("2d");

      if (tempCtx) {
        const imgData = tempCtx.createImageData(width, height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (Math.random() < 0.1) {
            data[i + 3] = 255;
          }
        }

        tempCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }

    ctx.restore();
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI);
  ctx.beginPath();

  const dig = (Math.PI / 5) * 4;

  for (let i = 0; i < 5; i += 1) {
    ctx.lineTo(Math.sin(i * dig) * radius, Math.cos(i * dig) * radius);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawArcText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  fontSize: number,
  color: string,
  stretch: number,
  scaleY: number,
  distribution: number,
  isBottom: boolean,
  fontFamily: string,
) {
  ctx.save();
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const count = text.length;

  let baseAngleRange: number;

  if (isBottom) {
    baseAngleRange = Math.PI / 3.5;
  } else if (count < 5) {
    baseAngleRange = Math.PI / 1.5;
  } else if (count > 12) {
    baseAngleRange = Math.PI * 1.6;
  } else {
    baseAngleRange = Math.PI * 1.5;
  }

  const angleRange = baseAngleRange * distribution;
  const startAngle = isBottom
    ? Math.PI / 2 + angleRange / 2
    : -Math.PI / 2 - angleRange / 2;
  const angleStep = isBottom
    ? -angleRange / (count > 1 ? count - 1 : 1)
    : angleRange / (count > 1 ? count - 1 : 1);

  for (let i = 0; i < count; i += 1) {
    const char = text[i];
    const angle =
      count === 1
        ? isBottom
          ? Math.PI / 2
          : -Math.PI / 2
        : startAngle + i * angleStep;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + Math.PI / 2);
    ctx.translate(0, -radius);

    if (isBottom) {
      ctx.rotate(Math.PI);
    }

    ctx.scale(stretch, scaleY);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

function drawSecurityLines(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  borderWidth: number,
  size: number,
) {
  ctx.save();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.0047;

  const lineLength = borderWidth * 1.2;
  const count = 8;

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(
      cx + (radius - lineLength / 2) * cos,
      cy + (radius - lineLength / 2) * sin,
    );
    ctx.lineTo(
      cx + (radius + lineLength / 2) * cos,
      cy + (radius + lineLength / 2) * sin,
    );
    ctx.stroke();
  }

  ctx.restore();
}

function applyRealisticEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const aging = 80 / 100;
  const bleed = 0.8;
  const paperNoise = 25;
  const blurLevel = 0.4;
  const originalData = new Uint8ClampedArray(data);
  const noiseScale = 0.08;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;

      if (originalData[index + 3] < 10) {
        continue;
      }

      const noiseX = Math.sin(x * noiseScale * 1.5);
      const noiseY = Math.cos(y * noiseScale);
      const random = Math.random();
      let density = noiseX * noiseY * 0.3 + random * 0.7;
      density = (density + 1) / 2;

      let newAlpha = originalData[index + 3];

      if (aging > 0) {
        const threshold = aging * 0.9;

        if (density < threshold) {
          const gap = (threshold - density) / threshold;
          newAlpha -= gap * 255 * 1.8;
        } else {
          newAlpha -= Math.random() * aging * 40;
        }
      }

      const grain = (Math.random() - 0.5) * paperNoise * 3;
      newAlpha += grain;
      newAlpha = Math.max(0, Math.min(255, newAlpha));
      data[index + 3] = newAlpha;

      if (bleed > 0 && newAlpha > 50 && Math.random() < 0.05 * bleed) {
        data[index + 3] = Math.min(255, newAlpha + 20);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  if (blurLevel > 0) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;

    const tempCtx = tempCanvas.getContext("2d");

    if (!tempCtx) {
      return;
    }

    tempCtx.putImageData(imgData, 0, 0);
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.filter = `blur(${blurLevel}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  if (!text) {
    return;
  }

  const words = text.split("");
  let line = "";

  for (let n = 0; n < words.length; n += 1) {
    const testLine = line + words[n];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n];
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}
