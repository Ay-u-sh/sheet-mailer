
import type { EmailDraft } from "../models/EmailDraft";
import type { MailingFile } from "../models/MailingFile";

const MAX_ATTACHMENT_SIZE_BYTES: number = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE_BYTES: number = 5 * 1024 * 1024;

export function addEmailAttachment(draft: EmailDraft, file: File): EmailDraft {
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES)
    throw new Error("Attachment size must not exceed 5 MB.");

  const attachment: MailingFile = {
    file,
    name: file.name,
    type: file.type,
    size: file.size,
  };

  return {
    ...draft,
    attachments: [...draft.attachments, attachment],
  };
}

export function removeEmailAttachment(
  draft: EmailDraft,
  attachment: MailingFile,
): EmailDraft {
  return {
    ...draft,
    attachments: draft.attachments.filter(
      (currentAttachment: MailingFile): boolean =>
        currentAttachment !== attachment,
    ),
  };
}

export function addEmailImage(draft: EmailDraft, file: File): EmailDraft {
  if (file.size > MAX_IMAGE_SIZE_BYTES)
    throw new Error("Image size must not exceed 5 MB.");

  const image: MailingFile = {
    file,
    name: file.name,
    type: file.type,
    size: file.size,
  };

  return {
    ...draft,
    images: [...draft.images, image],
  };
}

export function removeEmailImage(
  draft: EmailDraft,
  image: MailingFile,
): EmailDraft {
  return {
    ...draft,
    images: draft.images.filter(
      (currentImage: MailingFile): boolean => currentImage !== image,
    ),
  };
}