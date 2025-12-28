import { ListGroup } from "react-bootstrap";
import { Github, Globe, Linkedin, TwitterX } from "react-bootstrap-icons";
import type { UserProfile } from "~/types/user";


export default function ProfileLinks({ profile }: { profile: UserProfile }) {
  const links = [
    { icon: <Globe className="text-white me-3" size={20} />, label: 'Website', url: profile.websiteUrl },
    { icon: <Github className="text-white me-3" size={20} />, label: 'GitHub', url: profile.githubUrl },
    { icon: <Linkedin className="text-white me-3" size={20} />, label: 'LinkedIn', url: profile.linkedinUrl },
    { icon: <TwitterX className="text-white me-3" size={20} />, label: 'X (Twitter)', url: profile.xUrl },
  ].filter(link => link.url);

  if (links.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted mb-2">No social links.</p>
      </div>
    );
  }

  return (
    <ListGroup variant="flush">
      {links.map((link, index) => (
        <ListGroup.Item key={index} className="border-0 px-0 py-3">
          <a
            href={link.url!}
            target="_blank"
            className="text-decoration-none d-flex align-items-center"
          >
            {link.icon}
            <span className="fw-medium">{link.label}</span>
            <span className="ms-auto text-primary">
              <small>↗</small>
            </span>
          </a>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};
