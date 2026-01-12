import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
} from 'react-bootstrap';
import { useAuth } from '~/context/AuthContext';
import { apiFetch } from "~/utils/api";
import type { UserProfile, UserProfileUpdateRequest } from '~/types/user';
import ProfileLinks from '~/components/Shared/UserProfile/ProfileLinks';
import ProfileStats from '~/components/Shared/UserProfile/ProfileStats';
import type { APIError } from '~/types/api-error';
import ProfileSection from '~/components/Shared/UserProfile/ProfileSection';
import ProfileEditModal from '~/components/Shared/UserProfile/ProfileEditModal';
import { useLocation, useParams } from 'react-router';
import { useUser } from '~/context/UserContext';
import { Pencil } from 'react-bootstrap-icons';
import AvatarUploadModal from '~/components/Shared/UserProfile/AvatarUploadModal';

export default function UserProfilePage() {
  const { username: urlUsername } = useParams<{ username: string }>();
  const location = useLocation();
  const { auth } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editSection, setEditSection] = useState<string | null>(null);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const isOwnProfile = !urlUsername && location.pathname === '/profile';
  const targetUsername = isOwnProfile ? user?.username : urlUsername;

  const {
    data: profile,
    isLoading,
    isError,
    error
  } = useQuery<UserProfile, APIError>({
    queryKey: [`user-profile`, targetUsername],
    queryFn: async () => {
      if (isOwnProfile) {
        const res = await apiFetch(`/api/profile`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw data as APIError;
        }
        return data as UserProfile;
      } else {
        const res = await apiFetch(`/api/users/${targetUsername}/profile`, {
          headers: {
            "Content-Type": "application/json",
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw data as APIError;
        }
        return data as UserProfile;
      }
    },
    enabled: !!targetUsername,
    retry: 1,
  });

  const updateProfileMutation = useMutation<UserProfile, APIError, UserProfileUpdateRequest>({
    mutationFn: async (data: UserProfileUpdateRequest) => {
      data.username = targetUsername;
      const res = await apiFetch(`/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw responseData as APIError;
      }
      return responseData as UserProfile;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData([`user-profile`, targetUsername], updatedProfile);
      if (user?.username) {
        queryClient.setQueryData([`user-profile`, user.username], updatedProfile);
      }
    },
  });

  const handleUpdateProfile = async (data: UserProfileUpdateRequest) => {
    await updateProfileMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading profile...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Profile</Alert.Heading>
          <p>{error?.message || 'Failed to load profile'}</p>
          <Button
            variant="outline-danger"
            onClick={() => queryClient.invalidateQueries({ queryKey: [`user-profile`, { targetUsername }] })}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Profile Not Found</Alert.Heading>
          <p>The profile for {targetUsername ? `@${targetUsername}` : 'this user'} does not exist.</p>
        </Alert>
      </Container>
    );
  }

  const acceptanceRate = profile.totalSubmissions > 0
    ? Math.round((profile.acceptedSubmissions / profile.totalSubmissions) * 100)
    : 0;

  const totalSolved = profile.easySolved + profile.mediumSolved + profile.hardSolved;

  const isViewingOwnProfile = isOwnProfile || (user?.username === targetUsername);

  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <ProfileSection
            title="Basic Information"
            onEdit={isViewingOwnProfile ? () => setEditSection('basic') : undefined}
            showEdit={isViewingOwnProfile}
          >
            <Row className="align-items-center">
              <Col md={3} className="text-center mb-4 mb-md-0">
                <div className="d-flex flex-column align-items-center">
                  <div className="avatar-container position-relative mb-3">
                    {profile.avatarUrl ? (
                      <img
                        src={`/api/static/avatars/${profile.avatarUrl}`}
                        alt={`${profile.name || targetUsername} avatar`}
                        className="rounded"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        className="rounded border bg-primary bg-gradient d-flex align-items-center justify-content-center mx-auto"
                        style={{
                          width: '150px',
                          height: '150px',
                        }}
                      >
                        <span className="text-white fs-1 fw-bold">
                          {targetUsername?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>

                  {isViewingOwnProfile && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="d-flex align-items-center gap-1"
                      onClick={() => setShowAvatarUpload(true)}
                    >
                      <Pencil size={14} />
                      Change Photo
                    </Button>
                  )}
                </div>
              </Col>
              <Col md={9}>
                <div className="d-flex align-items-center mb-2">
                  <h1 className="h2 mb-0 me-2">{profile.name || targetUsername}</h1>
                  <Badge bg="secondary" className="fs-6 px-3 py-1">
                    @{targetUsername}
                  </Badge>
                </div>

                {profile.bio ? (
                  <div className="mb-4">
                    <p className="lead mb-0">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-muted fst-italic">
                      {isViewingOwnProfile ? 'Add a bio to tell others about yourself' : 'No bio yet'}
                    </p>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2">
                  {profile.country && (
                    <Badge bg="light" text="dark" className="px-3 py-2 d-flex align-items-center">
                      <span className="me-1">🌍</span>
                      {profile.country}
                    </Badge>
                  )}
                  {profile.preferredLanguage && (
                    <Badge bg="light" text="dark" className="px-3 py-2 d-flex align-items-center">
                      <span className="me-1">💬</span>
                      {profile.preferredLanguage}
                    </Badge>
                  )}
                  <Badge bg="info" className="px-3 py-2 d-flex align-items-center">
                    <span className="me-1">⭐</span>
                    {totalSolved} {totalSolved == 1 ? 'Problem' : 'Problems'} Solved
                  </Badge>
                </div>
              </Col>
            </Row>
          </ProfileSection>

          <ProfileSection
            title="Problem Solving Statistics"
            showEdit={false}
          >
            <ProfileStats profile={profile} />
          </ProfileSection>

          <ProfileSection
            title="Social Links"
            onEdit={isViewingOwnProfile ? () => setEditSection('links') : undefined}
            showEdit={isViewingOwnProfile}
          >
            <ProfileLinks profile={profile} />
          </ProfileSection>
        </Col>

        <Col lg={4}>
          <Card className="mb-4 border-0">
            <Card.Header className="border-0">
              <Card.Title className="mb-0 h6 fw-bold">Activity</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Last Active</small>
                <span className="fw-semibold">
                  {new Date(profile.lastActive).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="mb-3 pb-2 border-bottom">
                <small className="text-muted d-block mb-1">Member Since</small>
                <span className="fw-semibold">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <small className="text-muted d-block mb-1">Profile Updated</small>
                <span className="fw-semibold">
                  {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0">
            <Card.Header className="border-0">
              <Card.Title className="mb-0 h6 fw-bold">Acceptance Rate</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="display-4 fw-bold text-primary">
                  {acceptanceRate}%
                </div>
                <div className="text-muted small">
                  {profile.acceptedSubmissions.toLocaleString()} / {profile.totalSubmissions.toLocaleString()} submissions
                </div>
              </div>
              <div className="mb-3">
                <ProgressBar
                  now={acceptanceRate}
                  variant="primary"
                  className="mb-2"
                  style={{ height: '12px', borderRadius: '6px' }}
                />
                <div className="d-flex justify-content-between small text-muted">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isViewingOwnProfile && (
        <>
          <ProfileEditModal
            section={editSection}
            profile={profile}
            username={targetUsername!}
            onClose={() => setEditSection(null)}
            onUpdate={handleUpdateProfile}
            isUpdating={updateProfileMutation.isPending}
          />

          <AvatarUploadModal
            show={showAvatarUpload}
            onClose={() => setShowAvatarUpload(false)}
            currentAvatarUrl={profile.avatarUrl}
            username={targetUsername!}
          />
        </>
      )}
    </Container>
  );
}
