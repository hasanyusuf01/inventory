import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertDeviceSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { z } from "zod";

type FormData = z.infer<typeof insertDeviceSchema>;

interface AddDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddDeviceDialog({ open, onOpenChange, onSuccess }: AddDeviceDialogProps) {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(insertDeviceSchema),
    defaultValues: {
      deviceId: "",
      dateAdded: new Date().toISOString().split('T')[0],
      isIssued: false,
      issuedTo: "",
      dateIssued: "",
    },
  });

  const isIssued = watch("isIssued");

  const addDeviceMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/devices", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device added successfully",
      });
      reset();
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add device",
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
    
    addDeviceMutation.mutate(cleanedData);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID</Label>
            <Input
              id="deviceId"
              placeholder="e.g., AUV-SENSOR-001"
              {...register("deviceId")}
            />
            {errors.deviceId && (
              <p className="text-sm text-destructive">{errors.deviceId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateAdded">Date Added</Label>
            <Input
              id="dateAdded"
              type="date"
              {...register("dateAdded")}
            />
            {errors.dateAdded && (
              <p className="text-sm text-destructive">{errors.dateAdded.message}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isIssued"
              checked={isIssued}
              onCheckedChange={(checked) => setValue("isIssued", !!checked)}
            />
            <Label htmlFor="isIssued">Device is already issued</Label>
          </div>
          
          {isIssued && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label htmlFor="issuedTo">Issued To</Label>
                <Input
                  id="issuedTo"
                  placeholder="Person name"
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
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addDeviceMutation.isPending}>
              {addDeviceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Device
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
