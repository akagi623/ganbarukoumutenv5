
export const getReputationStars = (rep: number): string => '★'.repeat(Math.floor(rep)) + '☆'.repeat(Math.max(0, 5 - Math.floor(rep)));

export const formatFunds = (funds: number): string => `${funds.toLocaleString()}円`;
