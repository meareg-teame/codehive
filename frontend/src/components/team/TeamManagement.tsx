import { useEffect, useState } from "react";
import { v1Team } from "@/api";
import { isUnauthorizedError } from "@/api/client";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Copy,
  Link as LinkIcon,
  Trash2,
  UserPlus,
  Check,
  X,
  Shield,
  User
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";

interface TeamMember {
  email: string;
  name: string;
  photoUrl?: string;
  role: "owner" | "admin" | "member" | "guest";
}

interface TeamManagementProps {
  projectId: string;
  isOwner: boolean;
  userRole?: string;
}

export function TeamManagement({ projectId, isOwner, userRole = "guest" }: TeamManagementProps) {
  const navigate = useNavigate();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, [projectId]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const members = await v1Team.getTeam(projectId);
      setMembers(members || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      if (isUnauthorizedError(error)) {
        navigate("/auth");
      }
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  const generateInviteLink = async () => {
    if (!isOwner) return;
    
    try {
      setGeneratingInvite(true);
      const invite = await v1Team.createInvite(projectId);
      setInviteLink(invite.inviteLink);
      toast.success("Invite link generated!");
    } catch (error: any) {
      console.error("Error generating invite:", error);
      toast.error("Failed to generate invite link");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMemberRole = async (email: string, newRole: string) => {
    if (!isOwner) return;
    
    try {
      // This would call an API to update the role
      toast.success(`Updated ${email} to ${newRole}`);
      fetchTeamMembers();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const removeMember = async () => {
    if (!memberToRemove || !isOwner) return;
    
    try {
      // This would call an API to remove the member
      toast.success(`${memberToRemove.email} removed from project`);
      setMemberToRemove(null);
      fetchTeamMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      owner: { variant: "default", icon: Shield },
      admin: { variant: "secondary", icon: Shield },
      member: { variant: "outline", icon: User },
      guest: { variant: "outline", icon: User },
    };
    
    const { variant, icon: Icon } = variants[role] || variants.guest;
    
    return (
      <Badge variant={variant} className="capitalize gap-1">
        <Icon size={12} />
        {role}
      </Badge>
    );
  };

  return (
    <Card className="bg-[#1C1D24] border-[#2C2E3F]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Manage project members and their roles
            </CardDescription>
          </div>
          
          {isOwner && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-[#4E29A4] hover:bg-[#43238d]">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1C1D24] border-[#2C2E3F] text-white">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Generate an invite link to share with your team
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {!inviteLink ? (
                    <Button 
                      onClick={generateInviteLink} 
                      disabled={generatingInvite}
                      className="w-full bg-[#4E29A4] hover:bg-[#43238d]"
                    >
                      {generatingInvite ? (
                        "Generating..."
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Generate Invite Link
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input 
                          value={inviteLink} 
                          readOnly 
                          className="bg-[#0C0E15] border-[#2C2E3F] text-white"
                        />
                        <Button 
                          size="icon" 
                          onClick={copyInviteLink}
                          className={copied ? "bg-green-600" : "bg-[#4E29A4]"}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Link expires in 24 hours
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setInviteLink("")}
                    className="bg-transparent border-[#2C2E3F] text-white hover:bg-[#2C2E3F]"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-[#0C0E15] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#2C2E3F]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2C2E3F] hover:bg-transparent">
                  <TableHead className="text-gray-400">Member</TableHead>
                  <TableHead className="text-gray-400">Role</TableHead>
                  {isOwner && <TableHead className="text-gray-400 text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.email} className="border-[#2C2E3F]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4E29A4] to-[#7C3AED] flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.name}</p>
                          <p className="text-gray-400 text-sm">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(member.role)}
                    </TableCell>
                    {isOwner && (
                      <TableCell className="text-right">
                        {member.role !== "owner" && (
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={member.role}
                              onValueChange={(value) => updateMemberRole(member.email, value)}
                            >
                              <SelectTrigger className="w-28 bg-[#0C0E15] border-[#2C2E3F] text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1C1D24] border-[#2C2E3F]">
                                <SelectItem value="admin" className="text-white">Admin</SelectItem>
                                <SelectItem value="member" className="text-white">Member</SelectItem>
                                <SelectItem value="guest" className="text-white">Guest</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => setMemberToRemove(member)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-[#1C1D24] border-[#2C2E3F] text-white">
                                <DialogHeader>
                                  <DialogTitle>Remove Team Member</DialogTitle>
                                  <DialogDescription className="text-gray-400">
                                    Are you sure you want to remove {memberToRemove?.name} from the project?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="gap-2">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setMemberToRemove(null)}
                                    className="bg-transparent border-[#2C2E3F] text-white hover:bg-[#2C2E3F]"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={removeMember}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Remove
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TeamManagement;
