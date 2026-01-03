import { relations } from "drizzle-orm/relations";
import {
  account,
  apikey,
  filters,
  imageMetadata,
  images,
  imageTags,
  invitation,
  member,
  organization,
  session,
  tags,
  transformation,
  transformationMetadata,
  user,
} from "./schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  apikeys: many(apikey),
  invitations: many(invitation),
  members: many(member),
  sessions: many(session),
  images: many(images),
}));

export const apikeyRelations = relations(apikey, ({ one }) => ({
  user: one(user, {
    fields: [apikey.userId],
    references: [user.id],
  }),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  invitations: many(invitation),
  members: many(member),
  images: many(images),
}));

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const transformationRelations = relations(
  transformation,
  ({ one, many }) => ({
    image: one(images, {
      fields: [transformation.imageId],
      references: [images.id],
    }),
    filters: many(filters),
    transformationMetadata: many(transformationMetadata),
  }),
);

export const imagesRelations = relations(images, ({ one, many }) => ({
  transformations: many(transformation),
  user: one(user, {
    fields: [images.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [images.organizationId],
    references: [organization.id],
  }),
  imageMetadata: many(imageMetadata),
  imageTags: many(imageTags),
}));

export const filtersRelations = relations(filters, ({ one }) => ({
  transformation: one(transformation, {
    fields: [filters.transformationId],
    references: [transformation.id],
  }),
}));

export const imageMetadataRelations = relations(imageMetadata, ({ one }) => ({
  image: one(images, {
    fields: [imageMetadata.imageId],
    references: [images.id],
  }),
}));

export const transformationMetadataRelations = relations(
  transformationMetadata,
  ({ one }) => ({
    transformation: one(transformation, {
      fields: [transformationMetadata.transformationId],
      references: [transformation.id],
    }),
  }),
);

export const imageTagsRelations = relations(imageTags, ({ one }) => ({
  image: one(images, {
    fields: [imageTags.imageId],
    references: [images.id],
  }),
  tag: one(tags, {
    fields: [imageTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  imageTags: many(imageTags),
}));
