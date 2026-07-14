import React, { Children, cloneElement, isValidElement } from "react";
import type { CSSProperties, ReactElement, ReactNode } from "react";

type BlurOverlayProps = {
  children: ReactNode;
};

export function BlurOverlay({ children }: BlurOverlayProps) {
  const blurStyle: CSSProperties = {
    filter: "blur(10px)",
    pointerEvents: "none",
    transform: "translateZ(0)",
    userSelect: "none",
  };

  const blurredChildren = Children.map(children, (child) => {
    if (!isValidElement<{ style?: CSSProperties }>(child)) {
      return child;
    }

    const element = child as ReactElement<{ style?: CSSProperties }>;

    return cloneElement(element, {
      style: {
        ...element.props.style,
        ...blurStyle,
      },
    });
  });

  return React.createElement(
    "div",
    {
      "data-paywall": "blurred-content",
      style: {
        display: "contents",
      },
    },
    blurredChildren
  );
}
