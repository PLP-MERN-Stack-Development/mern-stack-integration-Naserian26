/**
 * Generates a unique slug from a given string.
 * @param {mongoose.Model} Model - The Mongoose model to check against for uniqueness.
 * @param {string} text - The text to generate a slug from (e.g., a post title).
 * @returns {Promise<string>} - A unique slug string.
 */
const generateUniqueSlug = async (Model, text) => {
  let slug = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove all non-word chars except hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim();

  // Check if the slug already exists using the passed-in Model
  const existingDoc = await Model.findOne({ slug });
  if (!existingDoc) {
    return slug;
  }

  // If slug exists, append a counter
  let counter = 1;
  let newSlug = `${slug}-${counter}`;

  // Keep incrementing the counter until we find a unique slug
  while (await Model.findOne({ slug: newSlug })) {
    counter++;
    newSlug = `${slug}-${counter}`;
  }

  return newSlug;
};

module.exports = generateUniqueSlug;