export default function Table({
    columns = [],
    data = [],
    onRowClick,
    className = ''
}) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.id}
                                className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-4 text-center text-gray-500"
                            >
                                No data available
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr
                                key={row.id || index}
                                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.id}
                                        className="px-6 py-4 text-sm text-gray-900"
                                    >
                                        {column.render
                                            ? column.render(row[column.id], row)
                                            : row[column.id]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
