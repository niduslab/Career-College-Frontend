interface GradientBackgroundProps {
  width?: string;
  height?: string;
  background?: string;
  blur?: string;
  right?: string | number;
  top?: string | number;
  left?: string | number;
  bottom?: string | number;
}

export function GradientBackground({
  width = "791px",
  height = "403px",
  background = "#4508A9",
  blur = "275px",
  right = 0,
  top = 0,
  left,
  bottom,
}: GradientBackgroundProps) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        width,
        height,
        borderRadius: width,
        background,
        filter: `blur(${blur})`,
        right: right !== undefined ? right : undefined,
        top: top !== undefined ? top : undefined,
        left: left !== undefined ? left : undefined,
        bottom: bottom !== undefined ? bottom : undefined,
        zIndex: 0,
      }}
    />
  );
}
