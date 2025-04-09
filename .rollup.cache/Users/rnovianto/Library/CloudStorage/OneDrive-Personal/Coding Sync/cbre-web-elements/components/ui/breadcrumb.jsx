import { __rest } from "tslib";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
function Breadcrumb(_a) {
    var props = __rest(_a, []);
    return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props}/>;
}
function BreadcrumbList(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5", className)} {...props}/>);
}
function BreadcrumbItem(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props}/>);
}
function BreadcrumbLink(_a) {
    var { asChild, className } = _a, props = __rest(_a, ["asChild", "className"]);
    const Comp = asChild ? Slot : "a";
    return (<Comp data-slot="breadcrumb-link" className={cn("text-light-grey hover:!text-dark-grey transition-colors duration-300", className)} {...props}/>);
}
function BreadcrumbPage(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" className={cn("text-dark-grey font-medium", className)} {...props}/>);
}
function BreadcrumbSeparator(_a) {
    var { children, className } = _a, props = __rest(_a, ["children", "className"]);
    return (<li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5 text-light-grey", className)} {...props}>
      {children !== null && children !== void 0 ? children : <ChevronRight />}
    </li>);
}
function BreadcrumbEllipsis(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span data-slot="breadcrumb-ellipsis" role="presentation" aria-hidden="true" className={cn("flex size-9 items-center justify-center text-light-grey", className)} {...props}>
      <MoreHorizontal className="size-4"/>
      <span className="sr-only">More</span>
    </span>);
}
export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis, };
//# sourceMappingURL=breadcrumb.jsx.map