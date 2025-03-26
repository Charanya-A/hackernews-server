export const getPaginationParams = (query: { [key: string]: string | undefined }) => {
    let page = Number(query["page"]);
    let limit = Number(query["limit"]);

    if (!Number.isInteger(page) || page < 1) page = 1; // Default to page 1 if invalid
    if (!Number.isInteger(limit) || limit < 1) limit = 30; // Default to 30 items per page

    const offset = (page - 1) * limit;
  
    return { page, limit, offset };
};
