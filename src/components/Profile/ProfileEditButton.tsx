import { Button, CloseButton, Dialog, Field, Fieldset, IconButton, Input, Textarea } from "@chakra-ui/react";
import type { UseMutationResult } from "@tanstack/react-query";
import { type FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdModeEdit } from "react-icons/md";
import type { ProfileData } from "../../../shared/types.ts";
import { validateProfileData } from "../../../shared/validation.ts";

interface Props {
  initialData: ProfileData;
  mutation: UseMutationResult<unknown, Error, ProfileData>;
}

const ProfileEditButton: FC<Props> = ({ initialData, mutation }) => {
  const [data, setData] = useState<ProfileData>(initialData);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleOpen = (open: boolean) => {
    setOpen(open);
    if (open) {
      setData(initialData);
      setPending(false);
      setError(null);
    }
  };
  const onChange = (event: { target: { name: string; value: string } }) => {
    setData((user) => ({ ...user, [event.target.name]: event.target.value }));
  };

  const action = () => {
    try {
      const validated = validateProfileData(data);
      setPending(true);
      mutation.mutate(validated, {
        onSuccess: () => toggleOpen(false),
        onError: (e) => {
          setPending(false);
          toast(e.message);
        },
      });
    } catch (e: unknown) {
      setPending(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => toggleOpen(open)}
      closeOnEscape={false}
      closeOnInteractOutside={false}
    >
      <Dialog.Trigger asChild>
        <IconButton
          variant="ghost"
          onClick={() => toggleOpen(true)}
        >
          <MdModeEdit />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Positioner>
        <Dialog.Content>
          <form action={action}>
            <Dialog.Header>
              <Dialog.Title>Edit Profile</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Fieldset.Root
                invalid={error !== null}
                size="lg"
              >
                <Dialog.CloseTrigger asChild>
                  <CloseButton disabled={pending} />
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
                      value={data.description ?? ""}
                      onChange={onChange}
                    />
                  </Field.Root>
                </Fieldset.Content>
                {error && <Fieldset.ErrorText>{error}</Fieldset.ErrorText>}
              </Fieldset.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                type="submit"
                disabled={pending}
              >
                Submit
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default ProfileEditButton;
