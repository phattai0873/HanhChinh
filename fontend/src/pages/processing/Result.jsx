import { useState } from 'react';
import Button from '../../components/common/Button';

export default function Result() {
    const [results, setResults] = useState({
        totalProcessed: 156,
        successful: 152,
        failed: 4,
        pending: 3,
        successRate: 97.4,
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Processing Results</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium">Total Processed</div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                        {results.totalProcessed}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium">Successful</div>
                    <div className="text-3xl font-bold text-green-600 mt-2">
                        {results.successful}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium">Failed</div>
                    <div className="text-3xl font-bold text-red-600 mt-2">
                        {results.failed}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium">Pending</div>
                    <div className="text-3xl font-bold text-yellow-600 mt-2">
                        {results.pending}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-gray-600 text-sm font-medium">Success Rate</div>
                    <div className="text-3xl font-bold text-purple-600 mt-2">
                        {results.successRate}%
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
                <Button variant="primary">Export Results</Button>
            </div>
        </div>
    );
}
