/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSongs } = require('../../utils/indexSongs');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Musik gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query = '';
    if (title && performer) {
      query = {
        text: 'SELECT id, title, performer FROM songs where lower(title) like $1 and lower(performer) like $2',
        values: [`%${title.toLowerCase()}%`, `%${performer.toLowerCase()}%`],
      };
    } else if (title) {
      query = {
        text: 'SELECT id, title, performer FROM songs where lower(title) like $1',
        values: [`%${title.toLowerCase()}%`],
      };
    } else if (performer) {
      query = {
        text: 'SELECT id, title, performer FROM songs where lower(performer) like $1',
        values: [`%${performer.toLowerCase()}%`],
      };
    } else {
      query = 'SELECT id, title, performer FROM songs';
    }

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Musik tidak ditemukan');
    }
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Musik tidak ditemukan');
    }
    return result.rows.map(mapDBToModelSongs)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui musik. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Musik gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;
