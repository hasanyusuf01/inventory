import { useMutation } from "@tanstack/react-query";
import { Device } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertTriangle } from "lucide-react";

interface DeleteDeviceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onSuccess: () => void;
}

export function DeleteDeviceDialog({ open, onOpenChange, device, onSuccess }: DeleteDeviceDialogProps) {
  const { toast } = useToast();

  const deleteDeviceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/devices/${device?.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Device deleted successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete device",
        variant: "destructive",
      });
    },
  });

  const handleConfirm = () => {
    deleteDeviceMutation.mutate();
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Device
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This action cannot be undone. This will permanently delete the device from the inventory.
          </p>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Device to delete:</p>
            <p className="font-medium text-gray-900">{device.deviceId}</p>
            {device.isIssued && (
              <>
                <p className="text-sm text-gray-600 mt-2">Currently issued to:</p>
                <p className="font-medium text-gray-900">{device.issuedTo}</p>
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              disabled={deleteDeviceMutation.isPending}
            >
              {deleteDeviceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Device
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
