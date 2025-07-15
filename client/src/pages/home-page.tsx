import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { AddDeviceDialog } from "@/components/add-device-dialog";
import { IssueDeviceDialog } from "@/components/issue-device-dialog";
import { DeleteDeviceDialog } from "@/components/delete-device-dialog";
import { Device } from "@shared/schema";
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Waves, 
  LogOut, 
  User,
  Box,
  CheckCircle,
  Hand,
  Calendar,
  Pencil,
  Trash2,
  Undo2,
  Cpu,
  Camera,
  Battery
} from "lucide-react";
import { format } from "date-fns";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'issued'>('all');
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [issueDeviceOpen, setIssueDeviceOpen] = useState(false);
  const [deleteDeviceOpen, setDeleteDeviceOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const { data: devices, isLoading: devicesLoading, refetch: refetchDevices } = useQuery({
    queryKey: ['/api/devices', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`/api/devices?${params}`);
      if (!response.ok) throw new Error('Failed to fetch devices');
      return response.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/devices/stats'],
    queryFn: async () => {
      const response = await fetch('/api/devices/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const handleIssueDevice = (device: Device) => {
    setSelectedDevice(device);
    setIssueDeviceOpen(true);
  };

  const handleDeleteDevice = (device: Device) => {
    setSelectedDevice(device);
    setDeleteDeviceOpen(true);
  };

  const getDeviceIcon = (deviceId: string) => {
    const id = deviceId.toLowerCase();
    if (id.includes('sensor')) return <Cpu className="h-5 w-5" />;
    if (id.includes('camera')) return <Camera className="h-5 w-5" />;
    if (id.includes('battery')) return <Battery className="h-5 w-5" />;
    return <Box className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Waves className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">AUV Club</h1>
                <p className="text-xs text-gray-600">Inventory Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 font-medium">{user?.username}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Device Inventory</h2>
              <p className="text-gray-600">Manage your AUV club devices and equipment</p>
            </div>
            <Button onClick={() => setAddDeviceOpen(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Device</span>
            </Button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Box className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Devices</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalDevices || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Available</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats?.availableDevices || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Hand className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Issued</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats?.issuedDevices || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Added This Month</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stats?.addedThisMonth || 0}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Device Table */}
        <Card>
          {/* Table Controls */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search devices..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Select value={statusFilter} onValueChange={(value: 'all' | 'available' | 'issued') => setStatusFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="issued">Issued</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={() => refetchDevices()}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued To</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devicesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : devices?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <Box className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No devices found</p>
                        <p className="text-sm">Add your first device to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  devices?.map((device: Device) => (
                    <TableRow key={device.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getDeviceIcon(device.deviceId)}
                          </div>
                          <div className="ml-4">
                            <span className="font-medium">{device.deviceId}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(device.dateAdded), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={device.isIssued ? "secondary" : "default"}>
                          {device.isIssued ? 'Issued' : 'Available'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.issuedTo || '-'}
                      </TableCell>
                      <TableCell>
                        {device.dateIssued ? format(new Date(device.dateIssued), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {device.isIssued ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleIssueDevice(device)}
                            >
                              <Undo2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleIssueDevice(device)}
                            >
                              <Hand className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDevice(device)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Dialogs */}
      <AddDeviceDialog 
        open={addDeviceOpen} 
        onOpenChange={setAddDeviceOpen}
        onSuccess={() => {
          refetchDevices();
          setAddDeviceOpen(false);
        }}
      />
      
      <IssueDeviceDialog 
        open={issueDeviceOpen} 
        onOpenChange={setIssueDeviceOpen}
        device={selectedDevice}
        onSuccess={() => {
          refetchDevices();
          setIssueDeviceOpen(false);
          setSelectedDevice(null);
        }}
      />
      
      <DeleteDeviceDialog 
        open={deleteDeviceOpen} 
        onOpenChange={setDeleteDeviceOpen}
        device={selectedDevice}
        onSuccess={() => {
          refetchDevices();
          setDeleteDeviceOpen(false);
          setSelectedDevice(null);
        }}
      />
    </div>
  );
}
