import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { R as Root2, P as Portal2, C as Content2, T as Title2, a as Cancel, A as Action, D as Description2, O as Overlay2 } from "../_libs/radix-ui__react-alert-dialog.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as createSsrRpc } from "./createSsrRpc-B_sfLEGR.mjs";
import { c as createServerFn } from "./server-CERHnNmm.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-3tVLAvsj.mjs";
import { o as objectType, s as stringType, e as enumType } from "../_libs/zod.mjs";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const AlertDialog = Root2;
const AlertDialogPortal = Portal2;
const AlertDialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay2,
  {
    className: cn(
      "fixed inset-0 z-50 bg-foreground/20 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = Overlay2.displayName;
const AlertDialogContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content2,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-5 border-2 bg-card p-6 shadow-2xl shadow-primary/10 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-3xl",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = Content2.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title2,
  {
    ref,
    className: cn("text-lg font-semibold", className),
    ...props
  }
));
AlertDialogTitle.displayName = Title2.displayName;
const AlertDialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description2,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
AlertDialogDescription.displayName = Description2.displayName;
const AlertDialogAction = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Action,
  {
    ref,
    className: cn(
      buttonVariants(),
      "rounded-full px-5 font-semibold shadow-sm transition-transform active:scale-95",
      className
    ),
    ...props
  }
));
AlertDialogAction.displayName = Action.displayName;
const AlertDialogCancel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Cancel,
  {
    ref,
    className: cn(
      buttonVariants({ variant: "outline" }),
      "rounded-full px-5 font-semibold mt-2 sm:mt-0 shadow-sm transition-transform active:scale-95",
      className
    ),
    ...props
  }
));
AlertDialogCancel.displayName = Cancel.displayName;
const isSuperuser = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ed927828b35765e5adf95229ff31f2114da55079729b90f8cd84bfbe2af92136"));
createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("4345bb7bcdd84c5bf05f04bc9fd6715116468d24e61063b1c4e49a9a37399bcb"));
const listAllWorkspaceUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("3a9ec4c6a5f96a1d925b0a97e8cf14c3b41d2d8affff3ff833a64b3aa9a9dea6"));
const grantSuperuserById = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("b865fe55dee2d02166fa7e26cd7c682973c1129037a7bb53f5059fec05e221fb"));
const revokeSuperuser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("0dc34336f508a18abb4c18c2ff00b5f36b0a71f0c369b1f9224375593f1ac9d6"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  email: stringType().email().max(255)
}).parse(d)).handler(createSsrRpc("8c56128b3989bea8cf2e5136b7a200cea85e25a865b63af586ad7b0e6cfe212a"));
const superuserUpdateMemberRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid(),
  role: enumType(["admin", "member"])
}).parse(d)).handler(createSsrRpc("4185eaf9ba152191ce3a46d1d83417b3b317ebcd40beec64bd9bc75fc912638f"));
const superuserRemoveMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid(),
  userId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("4d18776b9396bfefb3f802662724ff4222f70c157f7b9e1d005af863cb82ef83"));
const superuserUpdateUserEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid(),
  email: stringType().trim().toLowerCase().email().max(255)
}).parse(d)).handler(createSsrRpc("fed37a2110dbcbeec8548cd47e21ede4a52d967bcc444961cccb135b0125ef44"));
const superuserDeleteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  userId: stringType().uuid()
}).parse(d)).handler(createSsrRpc("731f39104cb64db47fffa8ca24ab6c764aa95b4c4f66265ef34e55ee883df45b"));
const requestPaidPlan = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((d) => objectType({
  tenantId: stringType().uuid().optional()
}).parse(d ?? {})).handler(createSsrRpc("49f9b21d77eb90091e38c3ee6de066c9e9bb9d1252ad2bfb322f608854327ee9"));
const listPaidPlanRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("182cea73b96365f89681faba8e4d6e8c86ec2498e3330013cb06fab3068cb2a7"));
export {
  AlertDialog as A,
  superuserRemoveMember as a,
  superuserUpdateUserEmail as b,
  superuserDeleteUser as c,
  requestPaidPlan as d,
  listPaidPlanRequests as e,
  AlertDialogContent as f,
  grantSuperuserById as g,
  AlertDialogHeader as h,
  isSuperuser as i,
  AlertDialogTitle as j,
  AlertDialogFooter as k,
  listAllWorkspaceUsers as l,
  AlertDialogCancel as m,
  AlertDialogAction as n,
  AlertDialogDescription as o,
  cn as p,
  revokeSuperuser as r,
  superuserUpdateMemberRole as s
};
