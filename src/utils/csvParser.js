import Papa from 'papaparse';

/**
 * Parses file contents using Papa Parse
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Checks parsed records against existing system transactions for potential matches.
 * Returns true if date, amount and description are identical.
 */
export const checkDuplicate = (newTx, existingTransactions) => {
  return existingTransactions.some((tx) => {
    const isSameDate = tx.date === newTx.date;
    const isSameAmount = Math.abs(tx.amount - newTx.amount) < 0.01;
    const isSameType = tx.type === newTx.type;
    
    // Normalize descriptions for matching
    const descA = (tx.description || '').toLowerCase().trim();
    const descB = (newTx.description || '').toLowerCase().trim();
    const isSameDesc = descA === descB || descA.includes(descB) || descB.includes(descA);

    return isSameDate && isSameAmount && isSameType && isSameDesc;
  });
};
