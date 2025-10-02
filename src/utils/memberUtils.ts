/**
 * 회원 관련 유틸리티 함수
 */

import { Member } from '@/types/member';
import { Organization } from '@/types/organization';
import { OrganizationUser } from '@/types/organizationUser';
import { IndividualUser } from '@/types/individualUser';

import { getMemberById as getMemberByIdFromMock } from '@/data/memberMockData';
import { getOrganizationByMemberId as getOrgByMemberIdFromMock } from '@/data/organizationMockData';
import {
  getOrganizationUsersByOrganizationId as getOrgUsersByOrgIdFromMock,
  getOrganizationUsersByMemberId as getOrgUsersByMemberIdFromMock,
  getOrganizationUserByEmail as getOrgUserByEmailFromMock
} from '@/data/organizationUserMockData';
import {
  getIndividualUserByMemberId as getIndividualByMemberIdFromMock,
  getIndividualUserByEmail as getIndividualByEmailFromMock
} from '@/data/individualUserMockData';

/**
 * memberId로 회원 정보 조회
 */
export const getMemberById = (memberId: string): Member | undefined => {
  return getMemberByIdFromMock(memberId);
};

/**
 * memberId로 조직 정보 조회 (기업 회원인 경우)
 */
export const getOrganizationByMemberId = (memberId: string): Organization | undefined => {
  return getOrgByMemberIdFromMock(memberId);
};

/**
 * organizationId로 조직 사용자 목록 조회
 */
export const getOrganizationUsersByOrganizationId = (
  organizationId: string
): OrganizationUser[] => {
  return getOrgUsersByOrgIdFromMock(organizationId);
};

/**
 * memberId로 조직 사용자 목록 조회
 */
export const getOrganizationUsersByMemberId = (memberId: string): OrganizationUser[] => {
  return getOrgUsersByMemberIdFromMock(memberId);
};

/**
 * memberId로 개인 회원 정보 조회
 */
export const getIndividualUserByMemberId = (memberId: string): IndividualUser | undefined => {
  return getIndividualByMemberIdFromMock(memberId);
};

/**
 * 이메일로 사용자 조회 (조직 사용자 + 개인 회원 통합)
 * 로그인 시 사용
 */
export const getUserByEmail = (
  email: string
): { type: 'organization'; user: OrganizationUser } | { type: 'individual'; user: IndividualUser } | null => {
  // 조직 사용자 검색
  const orgUser = getOrgUserByEmailFromMock(email);
  if (orgUser) {
    return { type: 'organization', user: orgUser };
  }

  // 개인 회원 검색
  const individualUser = getIndividualByEmailFromMock(email);
  if (individualUser) {
    return { type: 'individual', user: individualUser };
  }

  return null;
};

/**
 * 회원이 기업 회원인지 확인
 */
export const isCorporateMember = (memberId: string): boolean => {
  const member = getMemberById(memberId);
  return member?.type === 'corporate';
};

/**
 * 회원이 개인 회원인지 확인
 */
export const isIndividualMember = (memberId: string): boolean => {
  const member = getMemberById(memberId);
  return member?.type === 'individual';
};

/**
 * 회원의 전체 정보 조회 (회원 + 조직/개인 정보)
 */
export const getFullMemberInfo = (memberId: string) => {
  const member = getMemberById(memberId);
  if (!member) return null;

  if (member.type === 'corporate') {
    const organization = getOrganizationByMemberId(memberId);
    const users = getOrganizationUsersByMemberId(memberId);
    return {
      member,
      organization,
      users
    };
  } else {
    const individualUser = getIndividualUserByMemberId(memberId);
    return {
      member,
      individualUser
    };
  }
};
