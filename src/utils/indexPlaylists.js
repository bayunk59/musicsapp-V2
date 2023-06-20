/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const mapDBToModelPlaylists = ({
  id,
  name,
  created_at,
  updated_at,
}) => ({
  id,
  name,
  createdAt: created_at,
  updatedAt: updated_at,
});

module.exports = { mapDBToModelPlaylists };
