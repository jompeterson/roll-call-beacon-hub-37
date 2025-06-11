
interface CreatorInfo {
  name: string;
  email: string;
  organization: string;
}

interface RequestModalCreatorInfoProps {
  creatorInfo: CreatorInfo;
  createdAt: string;
}

export const RequestModalCreatorInfo = ({ creatorInfo, createdAt }: RequestModalCreatorInfoProps) => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-base">{creatorInfo.name}</h4>
          <p className="text-sm text-muted-foreground">{creatorInfo.email}</p>
          <p className="text-sm text-muted-foreground">{creatorInfo.organization}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Posted on</p>
          <p className="text-sm font-medium">{new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};
