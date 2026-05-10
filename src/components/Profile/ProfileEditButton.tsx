import { Button, CloseButton, Dialog, Field, Fieldset, IconButton, Input, Textarea } from "@chakra-ui/react";
import { type FC, useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import type { ProfileData } from "../../../shared/types.ts";

interface Props {
  initialData: ProfileData;
  onAction: (data: ProfileData, onSuccess: () => void) => void;
}

const ProfileEditButton: FC<Props> = ({ initialData, onAction }) => {
  const [data, setData] = useState<ProfileData>(initialData);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const onChange = (event: { target: { name: string; value: string } }) => {
    setData((user) => ({ ...user, [event.target.name]: event.target.value }));
  };

  const action = (_: FormData) => {
    onAction(data, () => setOpen(false)); // only close on success
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        setOpen(e.open);
        if (!e.open) setData(initialData);
      }}
    >
      <Dialog.Trigger asChild>
        <IconButton
          variant="ghost"
          onClick={() => setOpen(true)}
        >
          <MdModeEdit />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Edit Profile</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <form action={action}>
              <Fieldset.Root size="lg">
                <Dialog.CloseTrigger asChild>
                  <CloseButton />
                </Dialog.CloseTrigger>
                <Fieldset.Content>
                  <Field.Root>
                    <Field.Label>Display name</Field.Label>
                    <Input
                      name="displayName"
                      value={data.displayName}
                      onChange={onChange}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Description</Field.Label>
                    <Textarea
                      name="description"
                      value={data.description}
                      onChange={onChange}
                    />
                  </Field.Root>
                </Fieldset.Content>
                <Dialog.Footer>
                  <Button type="submit">Submit</Button>
                </Dialog.Footer>
              </Fieldset.Root>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default ProfileEditButton;
