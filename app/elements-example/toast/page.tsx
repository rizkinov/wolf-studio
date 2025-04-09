"use client";

import * as React from "react";
import Link from "next/link";
import { CBREButton } from "@/components/cbre-button";
import { CBREToaster, toast } from "@/components/cbre-toast";
import { Button } from "@/components/ui/button";
import { Info, Check, X, Bell, Loader2 } from "lucide-react";

export default function ToastExamplePage() {
  const [loading, setLoading] = React.useState(false);

  const simulateAsyncAction = () => {
    setLoading(true);
    toast({
      title: "Processing...",
      description: "Please wait while we process your request.",
    });

    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Success!",
        description: "Your request has been processed successfully.",
        variant: "success",
      });
    }, 2000);
  };

  return (
    <>
      <CBREToaster />
      <div className="min-h-screen bg-white">
        <div className="py-10 px-4 md:px-10 max-w-5xl mx-auto">
          <h1 className="text-6xl font-financier text-cbre-green mb-6">Toast Component</h1>
          <p className="text-dark-grey font-calibre mb-10 max-w-3xl">
            A toast is a non-intrusive message that appears temporarily to provide feedback to the user.
            Use toasts to show success messages, errors, or other important notifications.
          </p>
          
          {/* Basic Toast */}
          <div className="mb-16">
            <h2 className="text-4xl font-financier text-cbre-green mb-5">Basic Toast</h2>
            <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
              <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto space-y-6">
                <div className="space-y-2">
                  <p className="text-dark-grey font-calibre mb-2">Simple toast with basic content</p>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Information",
                          description: "This is a basic toast notification.",
                        });
                      }}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      Show Toast
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-light-grey mt-6">
              <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Implementation</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Add CBREToaster to your app
<CBREToaster />

// Show a toast
toast({
  title: "Information",
  description: "This is a basic toast notification.",
});`}
              </pre>
            </div>
          </div>

          {/* Toast Variations */}
          <div className="mb-16">
            <h2 className="text-4xl font-financier text-cbre-green mb-5">Toast Variations</h2>
            <div className="bg-[var(--lighter-grey)] p-4 md:p-8">
              <div className="border border-light-grey bg-white p-8 max-w-2xl mx-auto space-y-10">
                {/* Different Types */}
                <div className="space-y-2">
                  <p className="text-dark-grey font-calibre mb-2">Different Types</p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Success",
                          description: "Operation completed successfully.",
                          variant: "success",
                        });
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Success
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "Error",
                          description: "Something went wrong. Please try again.",
                          variant: "error",
                        });
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Error
                    </Button>
                  </div>
                </div>

                {/* With Action */}
                <div className="space-y-2">
                  <p className="text-dark-grey font-calibre mb-2">With Action Button</p>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        toast({
                          title: "New Message",
                          description: "You have a new message from John Doe.",
                          action: {
                            label: "View",
                            onClick: () => alert("Viewing message..."),
                          },
                        });
                      }}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      With Action
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                <div className="space-y-2">
                  <p className="text-dark-grey font-calibre mb-2">Loading State Example</p>
                  <div className="flex justify-center">
                    <Button 
                      variant="outline"
                      onClick={simulateAsyncAction}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="mr-2 h-4 w-4" />
                      )}
                      Process Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-light-grey mt-6">
              <h3 className="text-lg font-calibre font-medium text-dark-grey mb-3">Variations Implementation</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
{`// Success toast
toast({
  title: "Success",
  description: "Operation completed successfully.",
  variant: "success",
});

// Error toast
toast({
  title: "Error",
  description: "Something went wrong. Please try again.",
  variant: "error",
});

// Toast with action
toast({
  title: "New Message",
  description: "You have a new message from John Doe.",
  action: {
    label: "View",
    onClick: () => alert("Viewing message..."),
  },
});`}
              </pre>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <Link href="/elements-example">
              <CBREButton variant="outline">Back to Elements</CBREButton>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 