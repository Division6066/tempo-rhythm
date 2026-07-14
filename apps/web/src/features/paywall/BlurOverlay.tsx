import type { AriaAttributes, CSSProperties, ReactElement, ReactNode } from "react";
import React, { Children, cloneElement, isValidElement } from "react";

type BlurOverlayProps = {
  children: ReactNode;
};

type BlurrableElementProps = AriaAttributes & {
  style?: CSSProperties;
};

export function BlurOverlay({ children }: BlurOverlayProps) {
  const blurStyle: CSSProperties = {
    filter: "blur(10px)",
    pointerEvents: "none",
    transform: "translateZ(0)",
    userSelect: "none",
  };

  const blurredChildren = Children.map(children, (child) => {
    if (!isValidElement<BlurrableElementProps>(child)) {
      return child;
    }

    const element = child as ReactElement<BlurrableElementProps>;

    return cloneElement(element, {
      "aria-hidden": true,
      style: {
        ...element.props.style,
        ...blurStyle,
      },
    });
  });

  return React.createElement(
    "div",
    {
      "aria-hidden": true,
      "data-paywall": "blurred-content",
      style: {
        display: "contents",
      },
    },
    blurredChildren
  );
}
