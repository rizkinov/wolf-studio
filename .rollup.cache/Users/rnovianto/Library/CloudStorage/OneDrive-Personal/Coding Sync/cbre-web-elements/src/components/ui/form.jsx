"use client";
import { __rest } from "tslib";
import * as React from "react";
import { Controller, FormProvider, useFormContext, useFormState, } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
const Form = FormProvider;
const FormFieldContext = React.createContext({});
const FormField = (_a) => {
    var props = __rest(_a, []);
    return (<FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props}/>
    </FormFieldContext.Provider>);
};
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState } = useFormContext();
    const formState = useFormState({ name: fieldContext.name });
    const fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }
    const { id } = itemContext;
    return Object.assign({ id, name: fieldContext.name, formItemId: `${id}-form-item`, formDescriptionId: `${id}-form-item-description`, formMessageId: `${id}-form-item-message` }, fieldState);
};
const FormItemContext = React.createContext({});
function FormItem(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const id = React.useId();
    return (<FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props}/>
    </FormItemContext.Provider>);
}
function FormLabel(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { error, formItemId } = useFormField();
    return (<Label data-slot="form-label" data-error={!!error} className={cn("data-[error=true]:text-destructive", className)} htmlFor={formItemId} {...props}/>);
}
function FormControl(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (<div data-slot="form-control" id={formItemId} aria-describedby={!error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} className={cn(className)} {...props}/>);
}
function FormDescription(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { formDescriptionId } = useFormField();
    return (<p data-slot="form-description" id={formDescriptionId} className={cn("text-muted-foreground text-sm", className)} {...props}/>);
}
function FormMessage(_a) {
    var _b;
    var { className } = _a, props = __rest(_a, ["className"]);
    const { error, formMessageId } = useFormField();
    const body = error ? String((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : "") : props.children;
    if (!body) {
        return null;
    }
    return (<p data-slot="form-message" id={formMessageId} className={cn("text-destructive text-sm", className)} {...props}>
      {body}
    </p>);
}
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, };
//# sourceMappingURL=form.jsx.map