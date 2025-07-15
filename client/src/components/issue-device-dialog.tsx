import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateDeviceSchema, Device } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";

type FormData = z.infer<typeof updateDeviceSchema>;

interface IssueDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onSuccess: () => void;
}

export function IssueDeviceDialog({ open, onOpenChange, device, onSuccess }: IssueDeviceDialogProps) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(updateDeviceSchema),
    defaultValues: {
      isIssued: false,
      issuedTo: "",
      dateIssued: "",
    },
  });

  useEffect(() => {
    if (device) {
      if (device.isIssued) {
        // Return device
        setValue("isIssued", false);
        setValue("issuedTo", "");
        setValue("dateIssued", "");
      } else {
        // Issue device
        setValue("isIssued", true);
        setValue("dateIssued", new Date().toISOString().split('T')[0]);
      }
    }
  }, [device, setValue]);

  const updateDeviceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PATCH", `/api/devices/${device?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: device?.isIssued ? "Device returned successfully" : "Device issued successfully",
      });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update device",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Clean up data based on issued status
    const cleanedData = {
      ...data,
      issuedTo: data.isIssued ? data.issuedTo : null,
      dateIssued: data.isIssued ? data.dateIssued : null,
    };
    
    updateDeviceMutation.mutate(cleanedData);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!device) return null;

  const isReturning = device.isIssued;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isReturning ? "Return Device" : "Issue Device"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Device ID:</p>
          <p className="font-medium text-gray-900">{device.deviceId}</p>
          {isReturning && (
            <>
              <p className="text-sm text-gray-600 mt-2">Currently issued to:</p>
              <p className="font-medium text-gray-900">{device.issuedTo}</p>
            </>
          )}
        </div>
        
        {isReturning ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to return this device? This will mark it as available.
            </p>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => onSubmit({ isIssued: false, issuedTo: "", dateIssued: "" })}
                disabled={updateDeviceMutation.isPending}
              >
                {updateDeviceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Return Device
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="issuedTo">Issue To</Label>
              <Input
                id="issuedTo"
                placeholder="Enter person name"
                {...register("issuedTo")}
              />
              {errors.issuedTo && (
                <p className="text-sm text-destructive">{errors.issuedTo.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateIssued">Date Issued</Label>
              <Input
                id="dateIssued"
                type="date"
                {...register("dateIssued")}
              />
              {errors.dateIssued && (
                <p className="text-sm text-destructive">{errors.dateIssued.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateDeviceMutation.isPending}>
                {updateDeviceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Issue Device
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
