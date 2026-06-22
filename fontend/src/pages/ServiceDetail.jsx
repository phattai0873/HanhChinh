import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { applicationAPI } from "../services/api";
import Header from "../components/layout/Header";

import { toast } from 'react-toastify';
const servicesConfig = {
    1: {
        title: "Đăng ký khai sinh",
        icon: "👶",
        dept: "Phòng Hộ tịch & Dân sự",
        time: "3 ngày làm việc",
        fee: "Miễn phí",
        requirements: [
            "Tờ khai đăng ký khai sinh (có thể điền trực tuyến)",
            "Giấy chứng sinh do cơ sở y tế cấp (bản gốc)",
            "CCCD/CMND của cha và mẹ (bản photo)",
            "Sổ hộ khẩu hoặc giấy tờ cư trú của cha/mẹ",
        ],
        procedure: [
            "Người yêu cầu nộp hồ sơ tại bộ phận một cửa hoặc trực tuyến",
            "Cán bộ tiếp nhận kiểm tra hồ sơ",
            "Cập nhật thông tin vào hệ thống quản lý hộ tịch",
            "Cấp giấy khai sinh và bản sao",
        ],
        fields: [
            { name: "childName", label: "Họ và tên trẻ", type: "text", required: true, placeholder: "Nhập họ tên theo khai sinh" },
            { name: "dob", label: "Ngày sinh", type: "date", required: true },
            { name: "gender", label: "Giới tính", type: "select", required: true, options: ["Nam", "Nữ"] },
            { name: "birthPlace", label: "Nơi sinh", type: "text", required: true, placeholder: "Bệnh viện/cơ sở y tế" },
            { name: "fatherName", label: "Họ tên cha", type: "text", required: false, placeholder: "Để trống nếu không có" },
            { name: "motherName", label: "Họ tên mẹ", type: "text", required: true, placeholder: "Họ và tên đầy đủ" },
            { name: "permanentAddress", label: "Địa chỉ thường trú", type: "text", required: true, placeholder: "Địa chỉ đăng ký thường trú" },

        ]
    },
    2: {
        title: "Đăng ký kết hôn",
        icon: "💍",
        dept: "Phòng Hộ tịch & Dân sự",
        time: "5 ngày làm việc",
        fee: "Miễn phí",
        requirements: [
            "Tờ khai đăng ký kết hôn (theo mẫu)",
            "CCCD/CMND của hai bên nam nữ (bản photo)",
            "Giấy xác nhận tình trạng hôn nhân (nếu từng ở nơi khác)",
            "Sổ hộ khẩu hoặc giấy tờ cư trú",
        ],
        procedure: [
            "Nộp hồ sơ tại UBND nơi cư trú của một trong hai bên",
            "Cán bộ kiểm tra điều kiện kết hôn của hai bên",
            "Tổ chức lễ đăng ký kết hôn",
            "Cấp giấy chứng nhận kết hôn",
        ],
        fields: [
            { name: "maleName", label: "Họ tên chú rể", type: "text", required: true, placeholder: "Họ và tên đầy đủ" },
            { name: "maleDob", label: "Ngày sinh chú rể", type: "date", required: true },
            { name: "maleId", label: "CCCD chú rể", type: "text", required: true, placeholder: "Số căn cước công dân" },
            { name: "femaleName", label: "Họ tên cô dâu", type: "text", required: true, placeholder: "Họ và tên đầy đủ" },
            { name: "femaleDob", label: "Ngày sinh cô dâu", type: "date", required: true },
            { name: "femaleId", label: "CCCD cô dâu", type: "text", required: true, placeholder: "Số căn cước công dân" },
            { name: "registrationDate", label: "Ngày đăng ký dự kiến", type: "date", required: false },

        ]
    },
    3: {
        title: "Đăng ký khai tử",
        icon: "📜",
        dept: "Phòng Hộ tịch & Dân sự",
        time: "2 ngày làm việc",
        fee: "Miễn phí",
        requirements: [
            "Tờ khai đăng ký khai tử (theo mẫu)",
            "Giấy báo tử hoặc giấy xác nhận của cơ sở y tế",
            "CCCD/CMND của người đi khai (bản photo)",
            "Sổ hộ khẩu của người đã chết",
        ],
        procedure: [
            "Thân nhân hoặc người có trách nhiệm nộp hồ sơ",
            "Cán bộ kiểm tra và xác nhận thông tin",
            "Lập giấy chứng tử",
            "Xóa đăng ký thường trú trong sổ hộ khẩu",
        ],
        fields: [
            { name: "deceasedName", label: "Họ tên người mất", type: "text", required: true, placeholder: "Họ và tên đầy đủ" },
            { name: "deceasedDob", label: "Ngày sinh", type: "date", required: true },
            { name: "deathDate", label: "Ngày mất", type: "date", required: true },
            { name: "deathPlace", label: "Nơi mất", type: "text", required: true, placeholder: "Địa chỉ nơi xảy ra" },
            { name: "deathCause", label: "Nguyên nhân", type: "text", required: false, placeholder: "Theo giấy báo tử" },
            { name: "declarantName", label: "Người khai (họ tên)", type: "text", required: true, placeholder: "Người thân đến khai" },
            { name: "relationship", label: "Quan hệ với người mất", type: "text", required: true, placeholder: "Vợ/Chồng/Con..." },

        ]
    },
    4: {
        title: "Đăng ký tạm trú",
        icon: "🏠",
        dept: "Phòng Cư trú & Nhân khẩu",
        time: "3 ngày làm việc",
        fee: "Miễn phí",
        requirements: [
            "Tờ khai thay đổi thông tin cư trú (theo mẫu)",
            "CCCD/CMND của người đăng ký tạm trú",
            "Giấy tờ chứng minh chỗ ở hợp pháp (hợp đồng thuê nhà, hoặc giấy xác nhận của chủ nhà)",
            "Đối với người chưa thành niên: giấy tờ xác nhận quan hệ cha/mẹ-con",
        ],
        procedure: [
            "Người đăng ký nộp hồ sơ tại UBND nơi đến tạm trú",
            "Công an phường/xã xác nhận thông tin",
            "Cập nhật dữ liệu cư trú vào hệ thống",
            "Cấp xác nhận đăng ký tạm trú",
        ],
        fields: [
            { name: "fullName", label: "Họ và tên", type: "text", required: true, placeholder: "Nhập đầy đủ họ tên" },
            { name: "dob", label: "Ngày sinh", type: "date", required: true },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true, placeholder: "12 chữ số" },
            { name: "permanentAddress", label: "Địa chỉ thường trú", type: "text", required: true, placeholder: "Địa chỉ đăng ký gốc" },
            { name: "temporaryAddress", label: "Địa chỉ tạm trú", type: "text", required: true, placeholder: "Địa chỉ muốn đăng ký tạm trú" },
            { name: "fromDate", label: "Từ ngày", type: "date", required: true },
            { name: "toDate", label: "Đến ngày", type: "date", required: true },
            { name: "reason", label: "Lý do tạm trú", type: "text", required: true, placeholder: "Học tập/Làm việc/Khác..." },

        ]
    },
    5: {
        title: "Đăng ký thường trú",
        icon: "🏘️",
        dept: "Phòng Cư trú & Nhân khẩu",
        time: "15 ngày làm việc",
        fee: "Miễn phí",
        requirements: [
            "Phiếu báo thay đổi hộ khẩu, nhân khẩu",
            "CCCD/CMND hoặc hộ chiếu còn hiệu lực",
            "Giấy tờ chứng minh chỗ ở hợp pháp",
            "Giấy tờ chứng minh quan hệ với chủ hộ (nếu nhập vào hộ người khác)",
        ],
        procedure: [
            "Nộp hồ sơ tại UBND hoặc qua Cổng dịch vụ công",
            "Cán bộ thẩm tra hồ sơ và xác minh thực tế",
            "Trình lãnh đạo ký duyệt",
            "Cập nhật vào Cơ sở dữ liệu quốc gia về dân cư",
        ],
        fields: [
            { name: "fullName", label: "Họ và tên", type: "text", required: true, placeholder: "Họ và tên đầy đủ" },
            { name: "dob", label: "Ngày sinh", type: "date", required: true },
            { name: "idNumber", label: "Số CCCD", type: "text", required: true, placeholder: "12 chữ số" },
            { name: "currentAddress", label: "Địa chỉ hiện tại", type: "text", required: true, placeholder: "Địa chỉ đang ở" },
            { name: "newAddress", label: "Địa chỉ đăng ký thường trú mới", type: "text", required: true, placeholder: "Địa chỉ muốn nhập hộ khẩu" },
            { name: "householdHead", label: "Họ tên chủ hộ", type: "text", required: false, placeholder: "Để trống nếu lập hộ mới" },
            { name: "relationship", label: "Quan hệ với chủ hộ", type: "text", required: false, placeholder: "Vợ/Chồng/Con/Khác" },

        ]
    },
    6: {
        title: "Cấp CCCD/CMND",
        icon: "🪪",
        dept: "Phòng Cư trú & Nhân khẩu",
        time: "7 ngày làm việc",
        fee: "Theo quy định",
        requirements: [
            "Tờ khai căn cước công dân (thu thập tại nơi làm thủ tục)",
            "CCCD/CMND cũ (đối với trường hợp đổi, cấp lại)",
            "Sổ hộ khẩu hoặc xác nhận thông tin dân cư",
        ],
        procedure: [
            "Đến cơ quan công an nơi đăng ký thường trú",
            "Thu thập thông tin sinh trắc học (vân tay, ảnh chân dung)",
            "Cơ quan công an cấp tỉnh in thẻ",
            "Nhận kết quả sau 7-15 ngày làm việc",
        ],
        fields: [
            { name: "fullName", label: "Họ và tên", type: "text", required: true, placeholder: "Theo hộ khẩu" },
            { name: "dob", label: "Ngày sinh", type: "date", required: true },
            { name: "gender", label: "Giới tính", type: "select", required: true, options: ["Nam", "Nữ"] },
            { name: "hometown", label: "Quê quán", type: "text", required: true, placeholder: "Tỉnh/Thành phố" },
            { name: "permanentAddress", label: "Địa chỉ thường trú", type: "text", required: true },
            { name: "reason", label: "Lý do cấp", type: "select", required: true, options: ["Cấp mới", "Đổi CMND sang CCCD", "Cấp lại (mất/hỏng)", "Đổi do thông tin thay đổi"] },
            { name: "oldIdNumber", label: "Số CCCD/CMND cũ", type: "text", required: false, placeholder: "Nếu có" },

        ]
    },
    7: {
        title: "Cấp phiếu lý lịch tư pháp",
        icon: "⚖️",
        dept: "Phòng Tư pháp & Pháp chế",
        time: "10 ngày làm việc",
        fee: "200.000đ",
        requirements: [
            "Tờ khai yêu cầu cấp phiếu lý lịch tư pháp (theo mẫu)",
            "Bản sao CCCD/CMND hoặc hộ chiếu",
            "Bản sao sổ hộ khẩu hoặc giấy xác nhận cư trú",
            "Lệ phí 200.000đ/phiếu",
        ],
        procedure: [
            "Nộp hồ sơ tại Sở Tư pháp hoặc qua bưu điện",
            "Cán bộ tra cứu thông tin trong hệ thống lý lịch tư pháp",
            "Xác minh tại Tòa án nhân dân nếu cần",
            "Cấp và giao phiếu lý lịch tư pháp",
        ],
        fields: [
            { name: "fullName", label: "Họ và tên", type: "text", required: true },
            { name: "dob", label: "Ngày sinh", type: "date", required: true },
            { name: "gender", label: "Giới tính", type: "select", required: true, options: ["Nam", "Nữ"] },
            { name: "nationality", label: "Quốc tịch", type: "text", required: true, placeholder: "Việt Nam" },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true },
            { name: "permanentAddress", label: "Địa chỉ thường trú", type: "text", required: true },
            { name: "phieuType", label: "Loại phiếu", type: "select", required: true, options: ["Phiếu số 1 (cá nhân)", "Phiếu số 2 (tổ chức yêu cầu)"] },
            { name: "purpose", label: "Mục đích sử dụng", type: "text", required: true, placeholder: "Xin việc/Du học/Kết hôn..." },

        ]
    },
    8: {
        title: "Chứng thực bản sao",
        icon: "📄",
        dept: "Phòng Tư pháp & Pháp chế",
        time: "Trong ngày",
        fee: "2.000đ/trang",
        requirements: [
            "Bản chính giấy tờ cần chứng thực",
            "Bản photo giấy tờ cần chứng thực",
            "CCCD/CMND của người yêu cầu",
        ],
        procedure: [
            "Mang bản chính và bản photo đến UBND",
            "Cán bộ đối chiếu bản chính và bản photo",
            "Ký, đóng dấu xác nhận chứng thực",
            "Nộp lệ phí và nhận bản sao được chứng thực",
        ],
        fields: [
            { name: "requesterName", label: "Họ tên người yêu cầu", type: "text", required: true },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true },
            { name: "documentType", label: "Loại giấy tờ cần chứng thực", type: "text", required: true, placeholder: "CCCD/Bằng tốt nghiệp/Sổ hộ khẩu..." },
            { name: "numberOfCopies", label: "Số bản cần chứng thực", type: "text", required: true, placeholder: "Ví dụ: 2 bản" },
            { name: "purpose", label: "Mục đích sử dụng", type: "text", required: false, placeholder: "Nộp hồ sơ/Xin việc..." },

        ]
    },
    9: {
        title: "Chứng thực chữ ký",
        icon: "✍️",
        dept: "Phòng Tư pháp & Pháp chế",
        time: "Trong ngày",
        fee: "10.000đ/chữ ký",
        requirements: [
            "Giấy tờ, hợp đồng cần chứng thực chữ ký",
            "CCCD/CMND của người ký",
            "Người ký phải ký trước mặt cán bộ chứng thực",
        ],
        procedure: [
            "Mang giấy tờ đến UBND chưa ký",
            "Cán bộ kiểm tra nội dung giấy tờ",
            "Người yêu cầu ký trước mặt cán bộ",
            "Cán bộ chứng thực và đóng dấu",
        ],
        fields: [
            { name: "signerName", label: "Họ tên người ký", type: "text", required: true },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true },
            { name: "documentType", label: "Loại giấy tờ", type: "text", required: true, placeholder: "Loại hợp đồng/giấy tờ cần ký" },
            { name: "numberOfSignatures", label: "Số chữ ký cần chứng thực", type: "text", required: true, placeholder: "Ví dụ: 1 chữ ký" },

        ]
    },
    10: {
        title: "Đăng ký kinh doanh hộ cá thể",
        icon: "🏪",
        dept: "Phòng Kinh tế",
        time: "3 ngày làm việc",
        fee: "100.000đ",
        requirements: [
            "Giấy đề nghị đăng ký hộ kinh doanh (theo mẫu)",
            "CCCD/CMND của chủ hộ kinh doanh",
            "Danh sách thành viên hộ kinh doanh (nếu có)",
            "Bản sao Giấy phép đủ điều kiện kinh doanh (nếu ngành nghề yêu cầu)",
        ],
        procedure: [
            "Nộp hồ sơ tại UBND cấp huyện hoặc trực tuyến",
            "Cơ quan đăng ký kinh doanh xem xét hồ sơ",
            "Cấp Giấy chứng nhận đăng ký hộ kinh doanh",
            "Khắc dấu và đăng ký nộp thuế",
        ],
        fields: [
            { name: "businessName", label: "Tên hộ kinh doanh", type: "text", required: true, placeholder: "Tên đầy đủ" },
            { name: "ownerName", label: "Họ tên chủ hộ", type: "text", required: true },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true },
            { name: "businessAddress", label: "Địa chỉ kinh doanh", type: "text", required: true },
            { name: "businessType", label: "Ngành nghề kinh doanh", type: "text", required: true, placeholder: "Mô tả ngành nghề chính" },
            { name: "capital", label: "Vốn kinh doanh (VNĐ)", type: "text", required: true, placeholder: "Số vốn đầu tư ban đầu" },

        ]
    },
    11: {
        title: "Cấp phép xây dựng",
        icon: "🏗️",
        dept: "Phòng Quản lý đô thị",
        time: "15 ngày làm việc",
        fee: "Theo quy định",
        requirements: [
            "Đơn xin cấp giấy phép xây dựng (theo mẫu)",
            "Bản vẽ thiết kế xây dựng (mặt bằng, mặt đứng, mặt cắt)",
            "Giấy tờ chứng minh quyền sử dụng đất",
            "CCCD/CMND của chủ đầu tư",
        ],
        procedure: [
            "Nộp hồ sơ tại bộ phận một cửa UBND",
            "Cán bộ kiểm tra hồ sơ và khảo sát thực địa",
            "Thẩm định hồ sơ thiết kế",
            "Cấp Giấy phép xây dựng",
        ],
        fields: [
            { name: "ownerName", label: "Họ tên chủ đầu tư", type: "text", required: true },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true },
            { name: "constructionAddress", label: "Địa chỉ công trình", type: "text", required: true },
            { name: "constructionType", label: "Loại công trình", type: "select", required: true, options: ["Nhà ở riêng lẻ", "Nhà ở kết hợp kinh doanh", "Công trình dân dụng khác"] },
            { name: "area", label: "Diện tích xây dựng (m²)", type: "text", required: true },
            { name: "floors", label: "Số tầng", type: "text", required: true },
            { name: "landDocumentNumber", label: "Số Giấy chứng nhận QSD đất", type: "text", required: true },

        ]
    },
    12: {
        title: "Xác nhận lý lịch",
        icon: "📋",
        dept: "Phòng Tư pháp & Pháp chế",
        time: "2 ngày làm việc",
        fee: "Miễn phí",
        requirements: [
            "Tờ khai xác nhận lý lịch (theo mẫu)",
            "CCCD/CMND",
            "Sổ hộ khẩu",
        ],
        procedure: [
            "Nộp hồ sơ tại UBND nơi cư trú",
            "Cán bộ xác minh thông tin qua hệ thống",
            "Trình lãnh đạo ký xác nhận",
            "Đóng dấu và trả kết quả",
        ],
        fields: [
            { name: "fullName", label: "Họ và tên", type: "text", required: true },
            { name: "dob", label: "Ngày sinh", type: "date", required: true },
            { name: "gender", label: "Giới tính", type: "select", required: true, options: ["Nam", "Nữ"] },
            { name: "idNumber", label: "Số CCCD/CMND", type: "text", required: true },
            { name: "address", label: "Địa chỉ thường trú", type: "text", required: true },
            { name: "purpose", label: "Mục đích xác nhận", type: "text", required: true, placeholder: "Xin việc/Đi học/Thủ tục hành chính..." },

        ]
    }
};

export default function ServiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('userSidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleSidebar = () => {
        setSidebarOpen(prev => {
            const newState = !prev;
            localStorage.setItem('userSidebarOpen', JSON.stringify(newState));
            return newState;
        });
    };
    const [activeTab, setActiveTab] = useState("info");
    const [formData, setFormData] = useState({});
    const [attachments, setAttachments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submittedCode, setSubmittedCode] = useState("");

    const service = servicesConfig[parseInt(id)];

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) setUser(JSON.parse(userData));

        // Init form fields
        if (service) {
            const init = {};
            service.fields.forEach(f => { init[f.name] = ""; });
            setFormData(init);
        }
    }, [id]);



    const menuItems = [
        { path: "/", label: "Trang chủ", icon: "🏠" },
        { path: "/services", label: "Dịch vụ công", icon: "📋" },
        { path: "/track", label: "Tra cứu hồ sơ", icon: "🔍" },
        { path: "/feedback", label: "Phản ánh kiến nghị", icon: "💬" },
        { path: "/news", label: "Tin tức", icon: "📰" },
        { path: "/contact", label: "Liên hệ", icon: "📞" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Vui lòng đăng nhập để nộp hồ sơ!");
            navigate("/login");
            return;
        }
        setSubmitting(true);
        try {
            // Backend yêu cầu: { service_id, service_name, form_data }
            // Backend tự extract citizen info từ form_data
            const payload = {
                service_id: parseInt(id),
                service_name: service.title,
                form_data: {
                    ...formData,
                    // Thêm thông tin user vào form_data để backend có thể lấy
                    fullName: formData.fullName || formData.ownerName || formData.requesterName || user.full_name || user.username,
                    phone: formData.phone || user.phone || "",
                    email: formData.email || user.email || "",
                    idNumber: formData.idNumber || formData.maleId || formData.femaleId || "",
                    address: formData.permanentAddress || formData.address || formData.temporaryAddress || user.address || "Chưa cung cấp địa chỉ",
                    ...(attachments.length > 0 ? { _attachments: attachments.map(a => ({ _attachmentBase64: a.base64, _attachmentName: a.name })) } : {}),
                }
            };
            const result = await applicationAPI.create(payload);
            setSubmittedCode(result?.application?.application_code || result?.application_code || "HS" + Date.now());
            setSubmitted(true);
        } catch (err) {
            console.error("Nộp hồ sơ lỗi:", err);
            const msg = err?.response?.data?.error || "Có lỗi khi nộp hồ sơ. Vui lòng thử lại.";
            toast.info(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-gray-500 mb-4">Không tìm thấy dịch vụ này</p>
                    <Link to="/services" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex font-inter">
            {/* Sidebar */}
            <aside className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-30 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100 bg-gradient-to-r from-blue-700 to-indigo-800">
                    {sidebarOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg">🏛️</div>
                            <div>
                                <h1 className="text-white font-black text-sm uppercase tracking-wider leading-none">Hành chính số</h1>
                                <p className="text-blue-100 text-[9px] font-bold opacity-80 tracking-widest mt-0.5">Phường/Xã Cao Lãnh</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-lg mx-auto">🏛️</div>
                    )}
                </div>
                <nav className="p-3 space-y-1">
                    {menuItems.map((item, index) => (
                        <Link key={index} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${index === 1
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium'}`}>
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <Header
                    sidebarOpen={sidebarOpen}
                    toggleSidebar={toggleSidebar}
                    title={
                        <button onClick={() => navigate('/services')} className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                            ← <span className="font-bold text-gray-800">Quay lại</span>
                        </button>
                    }
                />

                {/* Page Content */}
                <main className="p-4 md:p-6 max-w-5xl mx-auto">
                    {/* Service Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-3xl p-8 mb-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="text-6xl">{service.icon}</div>
                            <div>
                                <h1 className="text-2xl font-black mb-1">{service.title}</h1>
                                <p className="text-blue-200 text-sm">{service.dept}</p>
                                <div className="flex gap-4 mt-3">
                                    <span className="text-blue-100 text-xs">⏱ {service.time}</span>
                                    <span className="text-blue-100 text-xs">💰 {service.fee}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => navigate('/feedback')}
                            className="shrink-0 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl font-black text-xs hover:bg-white/20 transition-all relative z-10">
                            💬 Gửi phản ánh liên quan
                        </button>
                    </div>

                    {/* Success Screen */}
                    {submitted ? (
                        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-black text-gray-800 mb-3">Nộp hồ sơ thành công!</h2>
                            <p className="text-gray-400 mb-4">Mã hồ sơ của bạn:</p>
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-8 py-4 inline-block mb-6">
                                <p className="text-2xl font-black text-blue-600">{submittedCode}</p>
                            </div>
                            <p className="text-sm text-gray-500 mb-8">Vui lòng lưu mã này để tra cứu tiến trình xử lý hồ sơ</p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/track" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all">
                                    Tra cứu hồ sơ
                                </Link>
                                <Link to="/services" className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                    Nộp hồ sơ khác
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm w-fit">
                                {[
                                    { key: "info", label: "Thông tin" },
                                    { key: "requirements", label: "Yêu cầu" },
                                    { key: "apply", label: "Nộp hồ sơ" },
                                ].map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                                        className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab: Info */}
                            {activeTab === "info" && (
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-black text-gray-800 mb-6">Quy trình thực hiện</h3>
                                    <div className="space-y-4">
                                        {service.procedure.map((step, i) => (
                                            <div key={i} className="flex gap-4 items-start">
                                                <div className="w-8 h-8 shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-black">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 pt-1">
                                                    <p className="text-sm text-gray-700 font-medium">{step}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tab: Requirements */}
                            {activeTab === "requirements" && (
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-black text-gray-800 mb-6">Thành phần hồ sơ</h3>
                                    <div className="space-y-3">
                                        {service.requirements.map((req, i) => (
                                            <div key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl">
                                                <span className="text-blue-600 font-black text-sm mt-0.5">✓</span>
                                                <p className="text-sm text-gray-700">{req}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tab: Apply */}
                            {activeTab === "apply" && (
                                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-black text-gray-800 mb-2">Điền thông tin hồ sơ</h3>
                                    <p className="text-sm text-gray-400 mb-6">Vui lòng điền đầy đủ thông tin để nộp hồ sơ trực tuyến</p>

                                    {!user && (
                                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 items-center">
                                            <span className="text-amber-500 text-xl">⚠️</span>
                                            <div>
                                                <p className="text-sm font-bold text-amber-700">Bạn chưa đăng nhập</p>
                                                <p className="text-xs text-amber-600">
                                                    <Link to="/login" className="underline font-bold">Đăng nhập</Link> để nộp hồ sơ trực tuyến
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {service.fields.map(field => (
                                                <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                                                    <label className="text-[9px] font-black text-gray-400 tracking-widest block mb-2">
                                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                                    </label>
                                                    {field.type === "select" ? (
                                                        <select
                                                            required={field.required}
                                                            value={formData[field.name] || ""}
                                                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-slate-50"
                                                        >
                                                            <option value="">-- Chọn --</option>
                                                            {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    ) : field.type === "textarea" ? (
                                                        <textarea
                                                            required={field.required}
                                                            rows={3}
                                                            value={formData[field.name] || ""}
                                                            onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                                                            placeholder={field.placeholder}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-slate-50 resize-none"
                                                        />
                                                    ) : (
                                                        <input
                                                            type={field.type}
                                                            required={field.required}
                                                            value={formData[field.name] || ""}
                                                            onChange={e => {
                                                                let val = e.target.value;
                                                                if (['phone', 'idNumber', 'maleId', 'femaleId', 'oldIdNumber'].includes(field.name) || (field.label && (field.label.toLowerCase().includes('cccd') || field.label.toLowerCase().includes('cmnd') || field.label.toLowerCase().includes('điện thoại')))) {
                                                                    val = val.replace(/\D/g, '');
                                                                }
                                                                setFormData({ ...formData, [field.name]: val });
                                                            }}
                                                            placeholder={field.placeholder}
                                                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-sm bg-slate-50"
                                                        />
                                                    )}
                                                </div>
                                            ))}

                                            {/* Static File Attachment Field outside the grid loop */}
                                            <div className="md:col-span-2 mt-2 p-4 bg-gray-50 border border-gray-200 border-dashed rounded-2xl">
                                                <label className="text-xs font-black text-gray-500 tracking-widest block mb-2">
                                                    Tài liệu đính kèm (Không bắt buộc)
                                                </label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                                                    onChange={async (e) => {
                                                        const files = Array.from(e.target.files);
                                                        if (!files.length) return;
                                                        const filePromises = files.map(file => {
                                                            return new Promise((resolve) => {
                                                                const reader = new FileReader();
                                                                reader.onloadend = () => {
                                                                    resolve({ name: file.name, base64: reader.result });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            });
                                                        });
                                                        const processedFiles = await Promise.all(filePromises);
                                                        setAttachments(prev => [...prev, ...processedFiles]);
                                                        e.target.value = ''; // Reset input so user can add more files
                                                    }}
                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer outline-none"
                                                />
                                                <p className="text-[11px] text-gray-400 mt-2">Dung lượng tối đa đề xuất: 10MB/file. Chọn hoặc giữ Ctrl/Shift để chọn nhiều file. Bạn có thể bấm nhiều lần để thêm nhiều tài liệu khác nhau.</p>

                                                {/* Render selected files */}
                                                {attachments.length > 0 && (
                                                    <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-2">
                                                        {attachments.map((att, index) => (
                                                            <li key={index} className="flex items-center justify-between bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                                                                <span className="text-sm text-gray-700 truncate max-w-[85%] pr-2 font-medium" title={att.name}>
                                                                    {att.name}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold px-2 py-1 text-xs rounded transition-colors"
                                                                >
                                                                    Xóa
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-2">
                                            <button type="button" onClick={() => setActiveTab("info")}
                                                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">
                                                ←
                                            </button>
                                            <button type="submit" disabled={submitting || !user}
                                                className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all disabled:opacity-60 shadow-lg shadow-blue-200 text-sm">
                                                {submitting ? '⏳ Đang xử lý...' : '📤 Nộp hồ sơ trực tuyến'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
