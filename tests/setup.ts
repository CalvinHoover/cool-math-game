import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// register jest-dom matchers for UI assertions
import '@testing-library/jest-dom/vitest';

// cleanup dom between tests to avoid leaked renders
afterEach(() => {
	cleanup();
});
