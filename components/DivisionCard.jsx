export default function DivisionCard({ divisi, interns, pembimbing }) {
    const getDivisionColor = (divisi) => {
        switch (divisi.toLowerCase()) {
            case 'umum':
                return 'text-slate-700 bg-slate-100';
            case 'produksi':
                return 'text-orange-700 bg-orange-100';
            case 'sosial':
                return 'text-yellow-700 bg-yellow-100';
            case 'distribusi':
                return 'text-purple-700 bg-purple-100';
            case 'nerwilis':
                return 'text-emerald-700 bg-emerald-100';
            case 'ptid':
                return 'text-blue-700 bg-blue-100';
            case 'sektoral':
                return 'text-pink-700 bg-pink-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const colorClass = getDivisionColor(divisi);

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 capitalize">
                        {divisi}
                    </h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                        {interns.length} orang
                    </span>
                </div>

                <p className="text-sm text-gray-500 mb-3">Pembimbing Tim: {pembimbing}</p>

                {/* Division Indicator */}
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${colorClass.replace('text-', 'bg-').replace('bg-', 'bg-').split(' ')[1]}`}></div>
                    <span className="text-sm text-gray-500">Tim {divisi.charAt(0).toUpperCase() + divisi.slice(1)}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {interns.length > 0 ? (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Daftar Peserta Magang</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {interns.map((intern, index) => (
                                <div key={index} className="flex items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-xs font-medium text-gray-600">
                                            {intern.nama.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-800 flex-1">{intern.nama}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-500">Belum ada peserta magang</p>
                    </div>
                )}
            </div>
        </div>
    );
}