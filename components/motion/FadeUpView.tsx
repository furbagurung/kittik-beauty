import { createEntranceTransition } from "@/constants/motion";
import { MotiView } from "moti";
import type { ComponentProps, ReactNode } from "react";

type FadeUpViewProps = ComponentProps<typeof MotiView> & {
  children: ReactNode;
  delay?: number;
  distance?: number;
};

export default function FadeUpView({
  animate,
  children,
  delay = 0,
  distance = 14,
  from,
  transition,
  ...props
}: FadeUpViewProps) {
  return (
    <MotiView
      from={from ?? { opacity: 0, translateY: distance }}
      animate={animate ?? { opacity: 1, translateY: 0 }}
      transition={transition ?? createEntranceTransition(delay)}
      {...props}
    >
      {children}
    </MotiView>
  );
}
