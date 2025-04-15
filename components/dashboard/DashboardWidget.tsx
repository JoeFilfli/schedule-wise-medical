import Link from 'next/link';

interface WidgetProps {
  title: string;
  description: string;
  emoji: string;
  href: string;
  color: string;
}

const DashboardWidget = ({ title, description, emoji, href, color }: WidgetProps) => {
  return (
    <Link href={href} className="text-decoration-none">
      <div className="card h-100 shadow-sm hover-shadow transition-all">
        <div className="card-body p-4 d-flex flex-column align-items-center text-center">
          <div className="widget-icon">
            <span className="emoji">{emoji}</span>
          </div>
          <h5 className="card-title mb-2 text-truncate w-100">{title}</h5>
          <p className="card-text text-muted widget-description">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default DashboardWidget; 